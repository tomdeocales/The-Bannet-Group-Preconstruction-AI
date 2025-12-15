import { NextRequest, NextResponse } from "next/server"
import { procoreRequest } from "@/lib/procoreClient"
import { createDrawingUpload, listProjectDrawingUploads } from "@/lib/procore/mockStore"
import type { ProcoreDrawingUpload } from "@/lib/procore/types"

const parseIntParam = (value: string | null, fallback: number) => {
  if (!value) return fallback
  const n = Number.parseInt(value, 10)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const procoreMode = process.env.PROCORE_MODE ?? "mock"
  const token = req.cookies.get("procore_access_token")?.value

  const { projectId } = await params
  const project_id = Number.parseInt(projectId, 10)

  const url = new URL(req.url)
  const page = parseIntParam(url.searchParams.get("page"), 1)
  const per_page = parseIntParam(url.searchParams.get("per_page"), 10)
  const view = url.searchParams.get("view") ?? "normal"
  const search = url.searchParams.get("filters[search]") ?? undefined

  if (procoreMode === "mock") {
    const data = listProjectDrawingUploads(project_id, { page, per_page, filters: { search } })
    return NextResponse.json({ project_id, view, ...data })
  }

  if (!token) {
    return NextResponse.json({ error: "Not connected to Procore" }, { status: 401 })
  }

  const qs = new URLSearchParams()
  qs.set("page", String(page))
  qs.set("per_page", String(per_page))
  qs.set("view", view)

  const items = (await procoreRequest(`/rest/v1.1/projects/${project_id}/drawing_uploads?${qs.toString()}`, token)) as ProcoreDrawingUpload[]
  const total_pages = items.length < per_page ? page : page + 1
  return NextResponse.json({ project_id, items, meta: { page, per_page, total: items.length, total_pages } })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const procoreMode = process.env.PROCORE_MODE ?? "mock"
  const token = req.cookies.get("procore_access_token")?.value

  const { projectId } = await params
  const project_id = Number.parseInt(projectId, 10)

  if (procoreMode !== "mock") {
    if (!token) return NextResponse.json({ error: "Not connected to Procore" }, { status: 401 })
    return NextResponse.json({ error: "Direct drawing upload is not implemented in live mode." }, { status: 405 })
  }

  const body = (await req.json().catch(() => null)) as
    | { filename?: string; drawing_set_id?: number | null; sheet_count?: number; page_count?: number }
    | null

  const filename = body?.filename?.trim()
  if (!filename) {
    return NextResponse.json({ error: "Missing filename" }, { status: 400 })
  }

  const upload = createDrawingUpload(project_id, {
    filename,
    drawing_set_id: typeof body?.drawing_set_id === "number" ? body?.drawing_set_id : null,
    sheet_count: typeof body?.sheet_count === "number" ? body?.sheet_count : undefined,
    page_count: typeof body?.page_count === "number" ? body?.page_count : undefined,
  })

  return NextResponse.json({ ok: true, project_id, upload })
}

