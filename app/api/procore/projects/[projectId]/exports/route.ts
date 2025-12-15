import { NextRequest, NextResponse } from "next/server"
import { appendSyncLog, createProjectDocument, createUpload, getProjectById, isAppEnabledForProject } from "@/lib/procore/mockStore"
import type { ProcoreEstimateDestination, ProcoreUpload, SyncLogType } from "@/lib/procore/types"

type ExportType = "estimate" | "zoning"

type ExportBody = {
  export_type: ExportType
  filename?: string
  folder_path?: string
  content_type?: string
  size?: number
  destination?: ProcoreEstimateDestination
}

const defaultFolderPath = (exportType: ExportType) => {
  if (exportType === "estimate") return "Preconstruction/Estimates"
  return "Preconstruction/Zoning"
}

const defaultFilename = (exportType: ExportType, projectNumber?: string, projectId?: number) => {
  const dateTag = new Date().toISOString().slice(0, 10)
  const base = exportType === "estimate" ? "Estimate_Final" : "Zoning_Summary"
  const idTag = projectNumber ? projectNumber.replace(/\s+/g, "-") : projectId ? `PRJ-${projectId}` : "PROJECT"
  const ext = exportType === "estimate" ? "xlsx" : "pdf"
  return `${base}_${idTag}_${dateTag}.${ext}`
}

const defaultContentType = (exportType: ExportType) => {
  if (exportType === "estimate") return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  return "application/pdf"
}

const exportLogType: Record<ExportType, SyncLogType> = {
  estimate: "estimate_export",
  zoning: "zoning_export",
}

const destinationLabel: Record<ProcoreEstimateDestination, string> = {
  budget: "Budget",
  commitments: "Commitments",
  prime_contract: "Prime Contract",
  sov: "Schedule of Values",
}

const exportSuccessMessage = (exportType: ExportType, filename: string) => {
  if (exportType === "estimate") return `Estimate exported and queued for Documents: ${filename}`
  return `Zoning summary exported and queued for Documents: ${filename}`
}

async function createUploadLive(params: { projectId: number; filename: string; contentType: string; size: number }, token: string): Promise<ProcoreUpload> {
  const companyId = process.env.PROCORE_COMPANY_ID
  const base = process.env.PROCORE_API_BASE
  if (!companyId) throw new Error("Missing PROCORE_COMPANY_ID env var")
  if (!base) throw new Error("Missing PROCORE_API_BASE env var")

  const url = `${base}/rest/v1.1/projects/${params.projectId}/uploads`
  const form = new FormData()
  form.set("response_filename", params.filename)
  form.set("response_content_type", params.contentType)
  form.set("size", String(params.size))

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Procore-Company-Id": companyId,
    },
    body: form,
  })

  const data = (await res.json()) as any
  if (!res.ok) {
    const message = data?.message || data?.error || `Procore upload create failed: ${res.status}`
    throw new Error(message)
  }

  return {
    uuid: String(data.uuid ?? data.id ?? ""),
    url: String(data.url ?? ""),
    fields: (data.fields ?? {}) as Record<string, string>,
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const procoreMode = process.env.PROCORE_MODE ?? "mock"
  const token = req.cookies.get("procore_access_token")?.value

  const { projectId } = await params
  const project_id = Number.parseInt(projectId, 10)
  if (!Number.isFinite(project_id)) {
    return NextResponse.json({ error: "Invalid project_id" }, { status: 400 })
  }

  if (!isAppEnabledForProject(project_id)) {
    return NextResponse.json(
      { error: "App is not configured for this project. Ask a Procore Company Admin to enable it." },
      { status: 403 },
    )
  }

  const body = (await req.json().catch(() => null)) as ExportBody | null
  const export_type = body?.export_type
  if (export_type !== "estimate" && export_type !== "zoning") {
    return NextResponse.json({ error: "Invalid export_type" }, { status: 400 })
  }

  const project = getProjectById(project_id)
  const filename = body?.filename?.trim() || defaultFilename(export_type, project?.project_number, project_id)
  const folder_path = body?.folder_path?.trim() || defaultFolderPath(export_type)
  const content_type = body?.content_type?.trim() || defaultContentType(export_type)
  const size = typeof body?.size === "number" && body.size > 0 ? Math.round(body.size) : export_type === "estimate" ? 240_000 : 180_000
  const destination = export_type === "estimate" ? (body?.destination ?? "budget") : undefined

  if (procoreMode === "live") {
    if (!token) {
      return NextResponse.json({ error: "Not connected to Procore" }, { status: 401 })
    }

    try {
      const upload = await createUploadLive({ projectId: project_id, filename, contentType: content_type, size }, token)

      appendSyncLog(project_id, {
        type: exportLogType[export_type],
        status: "success",
        message:
          export_type === "estimate" && destination
            ? `${exportSuccessMessage(export_type, filename)} • Push target: ${destinationLabel[destination]} (Upload UUID: ${upload.uuid || "pending"})`
            : `${exportSuccessMessage(export_type, filename)} (Upload UUID: ${upload.uuid || "pending"})`,
      })

      return NextResponse.json({
        ok: true,
        project_id,
        export_type,
        destination,
        upload,
        note: "Upload created in Procore. Associating to Documents is mocked until Bannett credentials/scopes are validated.",
      })
    } catch (err) {
      appendSyncLog(project_id, {
        type: exportLogType[export_type],
        status: "error",
        message: `Export failed to create Procore upload for ${filename}.`,
      })
      return NextResponse.json({ error: (err as Error).message }, { status: 502 })
    }
  }

  const upload = createUpload({ projectId: project_id, filename, contentType: content_type, size })
  const document = createProjectDocument(project_id, { folder_path, name: filename })

  appendSyncLog(project_id, {
    type: exportLogType[export_type],
    status: "success",
    message:
      export_type === "estimate" && destination
        ? `${exportSuccessMessage(export_type, filename)} • Push target: ${destinationLabel[destination]}`
        : exportSuccessMessage(export_type, filename),
  })

  appendSyncLog(project_id, {
    type: "documents_upload",
    status: document ? "info" : "warning",
    message: document
      ? `Saved to Documents: ${document.path}`
      : `Upload created, but Documents association could not be completed.`,
  })

  return NextResponse.json({ ok: true, project_id, export_type, destination, upload, document })
}
