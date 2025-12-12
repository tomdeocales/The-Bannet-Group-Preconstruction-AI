import { NextRequest, NextResponse } from "next/server"
import { procoreRequest } from "@/lib/procoreClient"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const token = _req.cookies.get("procore_access_token")?.value

  if (!token) {
    return NextResponse.json(
      { error: "Not connected to Procore" },
      { status: 401 }
    )
  }

  const { projectId } = await params

  try {
    const data = await procoreRequest(
      `/rest/v1.1/projects/${projectId}/bid_packages`,
      token
    )

    const bidPackages = (Array.isArray(data) ? data : []).map((bp: any) => ({
      id: bp.id,
      title: bp.title || bp.name,
      status: bp.status,
      due_date: bp.due_date,
    }))

    return NextResponse.json({ bidPackages })
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch bid packages", detail: String(err) },
      { status: 500 }
    )
  }
}
