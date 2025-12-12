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

  const { projectId } = await params

  const bidPackages = [
    {
      id: 6101,
      title: "MEP Bid Package — Riverside Medical Center",
      status: "Open",
      due_date: "2025-12-19",
    },
    {
      id: 6102,
      title: "Structural Steel Package",
      status: "Draft",
      due_date: "2025-12-23",
    },
    {
      id: 6103,
      title: "Concrete & Foundations",
      status: "Open",
      due_date: "2025-12-16",
    },
  ]

  return NextResponse.json({ mock: true, projectId, bidPackages })
}
