import { NextRequest, NextResponse } from "next/server"
import { procoreRequest } from "@/lib/procoreClient"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const token = _req.cookies.get("procore_access_token")?.value

  if (!token) {
    return NextResponse.json({ error: "Not connected to Procore" }, { status: 401 })
  }

  // ✅ unwrap the params promise
  const { projectId } = await params

  try {
    const data = await procoreRequest(
      `/rest/v1.1/projects/${projectId}/vendors`,
      token
    )

    const vendors = (Array.isArray(data) ? data : []).map((v: any) => ({
      id: v.id,
      name: v.name,
      trade: v.trade_type || null,
      phone: v.phone || null,
      city: v.city || null,
      state: v.state || null,
    }))

    return NextResponse.json({ vendors })
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch vendors", detail: String(err) },
      { status: 500 }
    )
  }
}
