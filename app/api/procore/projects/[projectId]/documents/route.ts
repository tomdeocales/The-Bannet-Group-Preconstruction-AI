import { NextRequest, NextResponse } from "next/server"

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

  const documents = [
    {
      id: 44001,
      name: "Zoning_Summary_Executive.pdf",
      path: "Project Documents > Preconstruction > Zoning",
      updated_at: "2025-12-09T16:15:00Z",
    },
    {
      id: 44002,
      name: "Estimate_Draft_Phase_1_Foundation.xlsx",
      path: "Project Documents > Preconstruction > Estimates",
      updated_at: "2025-12-09T14:34:00Z",
    },
    {
      id: 44003,
      name: "Drawings_Set_A01-A12.pdf",
      path: "Project Documents > Drawings",
      updated_at: "2025-12-08T10:45:00Z",
    },
  ]

  return NextResponse.json({ mock: true, projectId, documents })
}
