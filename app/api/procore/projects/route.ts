import { NextRequest, NextResponse } from "next/server"
import { procoreRequest } from "@/lib/procoreClient"
import { getCompany, listProjects } from "@/lib/procore/mockStore"
import type { ProcoreProject, ProcoreView } from "@/lib/procore/types"

const parseIntParam = (value: string | null, fallback: number) => {
  if (!value) return fallback
  const n = Number.parseInt(value, 10)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

const parseView = (value: string | null): ProcoreView => {
  if (value === "minimal" || value === "extended") return value
  return "normal"
}

export async function GET(req: NextRequest) {
  const procoreMode = process.env.PROCORE_MODE ?? "mock"
  const token = req.cookies.get("procore_access_token")?.value

  const url = new URL(req.url)
  const page = parseIntParam(url.searchParams.get("page"), 1)
  const per_page = parseIntParam(url.searchParams.get("per_page"), 10)
  const view = parseView(url.searchParams.get("view"))
  const sort = url.searchParams.get("sort") ?? undefined
  const search = url.searchParams.get("filters[search]") ?? undefined
  const name = url.searchParams.get("filters[name]") ?? undefined
  const byStatus = url.searchParams.get("filters[by_status]") ?? undefined

  if (procoreMode === "mock") {
    const company = getCompany()
    const data = listProjects({
      page,
      per_page,
      view,
      sort,
      filters: { search, name, by_status: byStatus },
    })
    return NextResponse.json({ connected: true, company, ...data })
  }

  if (!token) {
    return NextResponse.json({ error: "Not connected to Procore" }, { status: 401 })
  }

  const companyId = process.env.PROCORE_COMPANY_ID
  if (!companyId) {
    return NextResponse.json({ error: "Missing PROCORE_COMPANY_ID env var" }, { status: 500 })
  }

  const qs = new URLSearchParams()
  qs.set("company_id", companyId)
  qs.set("page", String(page))
  qs.set("per_page", String(per_page))
  if (byStatus) qs.set("filters[by_status]", byStatus)
  if (name) qs.set("filters[name]", name)
  if (search && !name) qs.set("filters[name]", search)
  if (sort) qs.set("sort", sort)
  if (view === "minimal") qs.set("serializer_view", "compact")

  const items = (await procoreRequest(`/rest/v1.0/projects?${qs.toString()}`, token)) as ProcoreProject[]
  const total_pages = items.length < per_page ? page : page + 1
  return NextResponse.json({
    connected: true,
    company: { id: Number(companyId), name: "The Bannett Group, LTD" },
    items,
    meta: { page, per_page, total: items.length, total_pages },
  })
}
