import { NextRequest, NextResponse } from "next/server"
import { appendSyncLog, getLastSyncAt, listProjectSyncLogs } from "@/lib/procore/mockStore"
import type { SyncLogStatus, SyncLogType } from "@/lib/procore/types"

export async function GET(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const procoreMode = process.env.PROCORE_MODE ?? "mock"
  const token = req.cookies.get("procore_access_token")?.value

  if (procoreMode === "live" && !token) {
    return NextResponse.json({ error: "Not connected to Procore" }, { status: 401 })
  }

  const { projectId } = await params
  const project_id = Number.parseInt(projectId, 10)

  const url = new URL(req.url)
  const page = Number.parseInt(url.searchParams.get("page") ?? "1", 10) || 1
  const per_page = Number.parseInt(url.searchParams.get("per_page") ?? "10", 10) || 10
  const search = url.searchParams.get("filters[search]") ?? undefined

  const data = listProjectSyncLogs(project_id, { page, per_page, filters: { search } })
  const last_sync_at = getLastSyncAt(project_id)

  return NextResponse.json({ project_id, last_sync_at, ...data })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const procoreMode = process.env.PROCORE_MODE ?? "mock"
  const token = req.cookies.get("procore_access_token")?.value

  if (procoreMode === "live") {
    if (!token) {
      return NextResponse.json({ error: "Not connected to Procore" }, { status: 401 })
    }
    return NextResponse.json({ error: "Not supported in live mode" }, { status: 405 })
  }

  const { projectId } = await params
  const project_id = Number.parseInt(projectId, 10)

  const body = (await req.json().catch(() => null)) as
    | { type?: SyncLogType; status?: SyncLogStatus; message?: string }
    | null

  const type = body?.type
  const status = body?.status
  const message = body?.message?.trim()

  if (!type || !status || !message) {
    return NextResponse.json({ error: "Missing type, status, or message" }, { status: 400 })
  }

  const entry = appendSyncLog(project_id, { type, status, message })
  return NextResponse.json({ ok: true, entry })
}
