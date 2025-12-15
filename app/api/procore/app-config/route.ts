import { NextRequest, NextResponse } from "next/server"
import { disableAppForProject, enableAppForProject, getAppConfig, getCompany, isAppEnabledForProject } from "@/lib/procore/mockStore"

export async function GET(req: NextRequest) {
  const procoreMode = process.env.PROCORE_MODE ?? "mock"
  const token = req.cookies.get("procore_access_token")?.value

  const url = new URL(req.url)
  const projectId = url.searchParams.get("project_id")
  const project_id = projectId ? Number.parseInt(projectId, 10) : null

  const config = getAppConfig()
  const company = getCompany()

  return NextResponse.json({
    procore_mode: procoreMode,
    connected: procoreMode === "mock" ? true : Boolean(token),
    company,
    config,
    enabled_for_project: project_id ? isAppEnabledForProject(project_id) : null,
  })
}

export async function POST(req: NextRequest) {
  const procoreMode = process.env.PROCORE_MODE ?? "mock"
  if (procoreMode !== "mock") {
    return NextResponse.json({ error: "Not supported in live mode" }, { status: 405 })
  }

  const body = (await req.json().catch(() => null)) as
    | { action?: "enable_project" | "disable_project"; project_id?: number }
    | null

  const action = body?.action
  const project_id = typeof body?.project_id === "number" ? body.project_id : null

  if (!action || !project_id) {
    return NextResponse.json({ error: "Missing action or project_id" }, { status: 400 })
  }

  const config = action === "enable_project" ? enableAppForProject(project_id) : disableAppForProject(project_id)
  return NextResponse.json({ ok: true, config })
}

