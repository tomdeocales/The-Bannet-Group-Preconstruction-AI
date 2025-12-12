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

  const { projectId } = await params   // ✅ unwrap params

  try {
    const data = await procoreRequest(
      `/rest/v1.1/projects/${projectId}/documents`,
      token
    )

    const documents = (Array.isArray(data) ? data : []).map((d: any) => ({
      id: d.id,
      name: d.name,
      path: d.path,
      updated_at: d.updated_at,
    }))

    return NextResponse.json({ documents })
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch documents", detail: String(err) },
      { status: 500 }
    )
  }
}
