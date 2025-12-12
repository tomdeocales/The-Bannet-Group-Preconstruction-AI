import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const token = req.cookies.get("procore_access_token")?.value

  if (!token) {
    return NextResponse.json(
      { error: "Not connected to Procore" },
      { status: 401 }
    )
  }

  const companyId = process.env.PROCORE_COMPANY_ID

  // Debug: make sure the env is actually loaded
  console.log("PROCORE_COMPANY_ID from env:", companyId)

  if (!companyId) {
    return NextResponse.json(
      { error: "Missing PROCORE_COMPANY_ID env var" },
      { status: 500 }
    )
  }

  const url = `${process.env.PROCORE_API_BASE}/rest/v1.1/projects?company_id=${companyId}`

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      // 👇 THIS is the header Procore is asking for
      "Procore-Company-Id": companyId,
    },
  })

  const data = await res.json()
  console.log("Procore /projects response:", data)

  return NextResponse.json(data)
}
