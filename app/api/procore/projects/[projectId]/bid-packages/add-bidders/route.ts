import { NextRequest, NextResponse } from "next/server"
import { procoreRequest } from "@/lib/procoreClient"

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

  try {
    for (const vendorId of vendorIds) {
      await procoreRequest(
        `/rest/v1.1/projects/${projectId}/bid_packages/${bidPackageId}/bidders`,
        token,
        {
          method: "POST",
          body: JSON.stringify({
            vendor_id: vendorId,
            notes: notes || "Added via Preconstruction AI mockup",
          }),
        }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to add bidders", detail: String(err) },
      { status: 500 }
    )
  }
}
