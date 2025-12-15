import { NextRequest, NextResponse } from "next/server"
import { procoreRequest } from "@/lib/procoreClient"
import { isAppEnabledForProject, listBidPackageBids } from "@/lib/procore/mockStore"
import type { ProcoreBid } from "@/lib/procore/types"

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
  const per_page = parseIntParam(url.searchParams.get("per_page"), 10)

  if (procoreMode === "mock") {
    if (!isAppEnabledForProject(project_id)) {
      return NextResponse.json(
        { error: "App is not configured for this project. Ask a Procore Company Admin to enable it." },
        { status: 403 },
      )
    }
    const data = listBidPackageBids(project_id, bid_package_id, { page, per_page })
    return NextResponse.json({ project_id, bid_package_id, ...data })
  }

  if (!token) {
    return NextResponse.json({ error: "Not connected to Procore" }, { status: 401 })
  }

  const qs = new URLSearchParams()
  qs.set("page", String(page))
  qs.set("per_page", String(per_page))

  const items = (await procoreRequest(
    `/rest/v1.0/projects/${project_id}/bid_packages/${bid_package_id}/bids?${qs.toString()}`,
    token,
  )) as ProcoreBid[]
  const total_pages = items.length < per_page ? page : page + 1
  return NextResponse.json({ project_id, bid_package_id, items, meta: { page, per_page, total: items.length, total_pages } })
}

