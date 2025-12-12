import { NextRequest, NextResponse } from "next/server"

type AddBiddersBody = {
  bidPackageId: number
  vendorIds: number[]
  notes?: string
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const token = req.cookies.get("procore_access_token")?.value

  if (!token) {
    return NextResponse.json(
      { error: "Not connected to Procore" },
      { status: 401 }
    )
  }

  const { projectId } = await params

  const body = (await req.json()) as AddBiddersBody
  const { bidPackageId, vendorIds, notes } = body

  if (!bidPackageId || !vendorIds?.length) {
    return NextResponse.json(
      { error: "bidPackageId and vendorIds are required" },
      { status: 400 }
    )
  }

  // Mock push: accept payload and return a simulated result.
  return NextResponse.json({
    mock: true,
    ok: true,
    projectId,
    bidPackageId,
    addedVendors: vendorIds,
    notes: notes || "Added via Preconstruction AI tool",
    timestamp: new Date().toISOString(),
  })
}
