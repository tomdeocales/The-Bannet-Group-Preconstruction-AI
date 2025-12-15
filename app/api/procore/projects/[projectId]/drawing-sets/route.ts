import { NextRequest, NextResponse } from "next/server"
import { procoreRequest } from "@/lib/procoreClient"
import { listProjectDrawingSets } from "@/lib/procore/mockStore"
import type { ProcoreDrawingSet } from "@/lib/procore/types"

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
  const search = url.searchParams.get("filters[search]") ?? undefined

  if (procoreMode === "mock") {
    const data = listProjectDrawingSets(project_id, { page, per_page, filters: { search } })
    return NextResponse.json({ project_id, ...data })
  }

  if (!token) {
    return NextResponse.json({ error: "Not connected to Procore" }, { status: 401 })
  }

  const qs = new URLSearchParams()
  qs.set("page", String(page))
  qs.set("per_page", String(per_page))

  const items = (await procoreRequest(`/rest/v1.0/projects/${project_id}/drawing_sets?${qs.toString()}`, token)) as ProcoreDrawingSet[]
  const total_pages = items.length < per_page ? page : page + 1
  return NextResponse.json({ project_id, items, meta: { page, per_page, total: items.length, total_pages } })
}

