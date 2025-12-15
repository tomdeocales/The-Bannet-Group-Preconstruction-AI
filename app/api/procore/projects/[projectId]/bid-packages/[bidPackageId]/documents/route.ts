import { NextRequest, NextResponse } from "next/server"
import { procoreRequest } from "@/lib/procoreClient"
import { isAppEnabledForProject, listBidPackageDocuments } from "@/lib/procore/mockStore"
import type { ProcoreDocumentEntry } from "@/lib/procore/types"

const parseIntParam = (value: string | null, fallback: number) => {
  if (!value) return fallback
  const n = Number.parseInt(value, 10)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; bidPackageId: string }> },
) {
  const procoreMode = process.env.PROCORE_MODE ?? "mock"
  const token = req.cookies.get("procore_access_token")?.value

  const { projectId, bidPackageId } = await params
  const project_id = Number.parseInt(projectId, 10)
  const bid_package_id = Number.parseInt(bidPackageId, 10)

  const url = new URL(req.url)
  const page = parseIntParam(url.searchParams.get("page"), 1)
  const per_page = parseIntParam(url.searchParams.get("per_page"), 50)

  if (procoreMode === "mock") {
    if (!isAppEnabledForProject(project_id)) {
      return NextResponse.json(
        { error: "App is not configured for this project. Ask a Procore Company Admin to enable it." },
        { status: 403 },
      )
    }
    const items = listBidPackageDocuments(project_id, bid_package_id)
    const total_pages = items.length < per_page ? page : page + 1
    const start = (page - 1) * per_page
    const paged = items.slice(start, start + per_page)
    return NextResponse.json({ project_id, bid_package_id, items: paged, meta: { page, per_page, total: items.length, total_pages } })
  }

  if (!token) {
    return NextResponse.json({ error: "Not connected to Procore" }, { status: 401 })
  }

  const companyId = process.env.PROCORE_COMPANY_ID
  if (!companyId) {
    return NextResponse.json({ error: "Missing PROCORE_COMPANY_ID env var" }, { status: 500 })
  }

  const itemsRaw = (await procoreRequest(
    `/rest/v1.0/companies/${companyId}/planroom/bid_packages/${bid_package_id}/documents`,
    token,
  )) as any[]

  const items: ProcoreDocumentEntry[] = (itemsRaw ?? []).map((d) => ({
    id: Number(d.id ?? d.document_id ?? d.file_id ?? 0),
    name: String(d.name ?? d.filename ?? d.file_name ?? "Document"),
    document_type: "file",
    parent_id: null,
    path: d.path ? String(d.path) : undefined,
    created_at: d.created_at ? String(d.created_at) : undefined,
    updated_at: d.updated_at ? String(d.updated_at) : undefined,
  }))

  const total_pages = items.length < per_page ? page : page + 1
  const start = (page - 1) * per_page
  return NextResponse.json({ project_id, bid_package_id, items: items.slice(start, start + per_page), meta: { page, per_page, total: items.length, total_pages } })
}

