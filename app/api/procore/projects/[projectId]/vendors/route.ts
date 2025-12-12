import { NextRequest, NextResponse } from "next/server"

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

  const vendors = [
    { id: 9011, name: "Summit Mechanical Solutions", trade: "HVAC", phone: "(503) 555-0123", city: "Portland", state: "OR" },
    { id: 9012, name: "ElectroPro Commercial", trade: "Electrical", phone: "(503) 555-0144", city: "Beaverton", state: "OR" },
    { id: 9013, name: "Cascade Plumbing & Fire", trade: "Plumbing", phone: "(503) 555-0198", city: "Gresham", state: "OR" },
    { id: 9014, name: "Atlas Structural Steel", trade: "Steel", phone: "(360) 555-0111", city: "Vancouver", state: "WA" },
    { id: 9015, name: "Foundation Masters Inc", trade: "Concrete", phone: "(503) 555-0136", city: "Tigard", state: "OR" },
    { id: 9016, name: "Northwest Interiors Group", trade: "Drywall", phone: "(503) 555-0162", city: "Portland", state: "OR" },
    { id: 9017, name: "Pioneer Fire Protection", trade: "Fire Protection", phone: "(503) 555-0179", city: "Hillsboro", state: "OR" },
    { id: 9018, name: "Evergreen Siteworks", trade: "Civil/Site", phone: "(503) 555-0158", city: "Clackamas", state: "OR" },
  ]

  return NextResponse.json({ mock: true, projectId, vendors })
}
