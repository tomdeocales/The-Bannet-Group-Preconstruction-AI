import { NextRequest, NextResponse } from "next/server"
import { procoreRequest } from "@/lib/procoreClient"
import { listProjectDocuments } from "@/lib/procore/mockStore"
import type { ProcoreDocumentEntry, ProcoreView } from "@/lib/procore/types"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const procoreMode = process.env.PROCORE_MODE ?? "mock"
  const token = req.cookies.get("procore_access_token")?.value

  const { projectId } = await params
  const project_id = Number.parseInt(projectId, 10)

  const url = new URL(req.url)
  const page = Number.parseInt(url.searchParams.get("page") ?? "1", 10) || 1
  const per_page = Number.parseInt(url.searchParams.get("per_page") ?? "10", 10) || 10
  const view = (url.searchParams.get("view") as ProcoreView | null) ?? "normal"
  const sort = url.searchParams.get("sort") ?? undefined
  const search = url.searchParams.get("filters[search]") ?? undefined
  const folder_id = url.searchParams.get("filters[folder_id]") ?? undefined

  if (procoreMode === "mock") {
    const data = listProjectDocuments(project_id, { page, per_page, view, sort, filters: { search, folder_id } })
    return NextResponse.json({ project_id, ...data })
  }

  if (!token) {
    return NextResponse.json({ error: "Not connected to Procore" }, { status: 401 })
  }

  const qs = new URLSearchParams()
  qs.set("page", String(page))
  qs.set("per_page", String(per_page))
  qs.set("view", view === "minimal" ? "normal" : view)
  if (sort) qs.set("sort", sort)
  if (search) qs.set("filters[search]", search)
  if (folder_id) qs.set("filters[folder_id]", folder_id)

  const items = (await procoreRequest(`/rest/v2.0/projects/${project_id}/documents?${qs.toString()}`, token)) as ProcoreDocumentEntry[]
  const total_pages = items.length < per_page ? page : page + 1
  return NextResponse.json({ project_id, items, meta: { page, per_page, total: items.length, total_pages } })
}
