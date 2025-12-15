import { NextRequest, NextResponse } from "next/server"
import { procoreRequest } from "@/lib/procoreClient"
import { listProjectCostCodes } from "@/lib/procore/mockStore"
import type { ProcoreCostCode } from "@/lib/procore/types"

const parseIntParam = (value: string | null, fallback: number) => {
  if (!value) return fallback
  const n = Number.parseInt(value, 10)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

const includesSearch = (haystack: string, query?: string) => {
  if (!query) return true
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  return haystack.toLowerCase().includes(needle)
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
    const data = listProjectCostCodes(project_id, { page, per_page, filters: { search } })
    return NextResponse.json({ project_id, ...data })
  }

  if (!token) {
    return NextResponse.json({ error: "Not connected to Procore" }, { status: 401 })
  }

  const qs = new URLSearchParams()
  qs.set("project_id", String(project_id))
  qs.set("page", String(page))
  qs.set("per_page", String(per_page))
  qs.set("view", "normal")

  const itemsRaw = (await procoreRequest(`/rest/v1.0/cost_codes?${qs.toString()}`, token)) as any[]
  const items = (itemsRaw ?? []).map(
    (c): ProcoreCostCode => ({
      id: Number(c.id),
      full_code: String(c.full_code ?? c.code ?? ""),
      name: String(c.name ?? c.description ?? ""),
      created_at: c.created_at ? String(c.created_at) : undefined,
      updated_at: c.updated_at ? String(c.updated_at) : undefined,
    }),
  )

  const filtered = search ? items.filter((c) => includesSearch(`${c.full_code} ${c.name}`, search)) : items
  const total_pages = filtered.length < per_page ? page : page + 1
  return NextResponse.json({ project_id, items: filtered, meta: { page, per_page, total: filtered.length, total_pages } })
}

