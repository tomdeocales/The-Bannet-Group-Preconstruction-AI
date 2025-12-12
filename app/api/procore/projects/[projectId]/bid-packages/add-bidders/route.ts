import { NextRequest, NextResponse } from "next/server"
import { procoreRequest } from "@/lib/procoreClient"
import { addBidders, appendSyncLog } from "@/lib/procore/mockStore"

type AddBiddersBody = {
  bidPackageId: number
  vendorIds: number[]
  notes?: string
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const procoreMode = process.env.PROCORE_MODE ?? "mock"
  const token = req.cookies.get("procore_access_token")?.value

  const { projectId } = await params
  const project_id = Number.parseInt(projectId, 10)

  const body = (await req.json()) as AddBiddersBody
  const { bidPackageId, vendorIds, notes } = body

  if (!bidPackageId || !vendorIds?.length) {
    return NextResponse.json(
      { error: "bidPackageId and vendorIds are required" },
      { status: 400 }
    )
  }

  if (procoreMode === "mock") {
    const result = addBidders({ projectId: project_id, bidPackageId, vendorIds, notes })
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 404 })
    }
    return NextResponse.json(result)
  }

  if (!token) {
    return NextResponse.json({ error: "Not connected to Procore" }, { status: 401 })
  }

  // Live mode: map "add bidders" to creating bids within a bid package.
  await Promise.all(
    vendorIds.map((vendor_id) =>
      procoreRequest(`/rest/v1.0/projects/${project_id}/bid_packages/${bidPackageId}/bids`, token, {
        method: "POST",
        body: JSON.stringify({
          bid: {
            vendor_id,
            bidder_comments: notes ?? "",
            submitted: false,
          },
        }),
      }),
    ),
  )

  appendSyncLog(project_id, {
    type: "bidder_push",
    status: "success",
    message: `Added ${vendorIds.length} bidder(s) to bid package #${bidPackageId}.`,
  })

  return NextResponse.json({
    ok: true,
    project_id,
    bid_package_id: bidPackageId,
    vendor_ids: vendorIds,
    notes: notes ?? "",
    created_at: new Date().toISOString(),
  })
}
