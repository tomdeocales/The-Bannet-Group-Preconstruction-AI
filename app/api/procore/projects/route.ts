import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const token = req.cookies.get("procore_access_token")?.value

  const projects = [
    {
      id: 124512,
      name: "Riverside Medical Center",
      project_number: "BG-25-041",
      city: "Portland",
      state: "OR",
      status: "Active",
      delivery_method: "CM/GC",
    },
    {
      id: 124513,
      name: "Harbor View Office Complex",
      project_number: "BG-25-038",
      city: "Tacoma",
      state: "WA",
      status: "Active",
      delivery_method: "Design-Build",
    },
    {
      id: 124514,
      name: "Westfield Shopping Plaza",
      project_number: "BG-25-029",
      city: "Salem",
      state: "OR",
      status: "Preconstruction",
      delivery_method: "Hard Bid",
    },
    {
      id: 124515,
      name: "Downtown Transit Hub",
      project_number: "BG-25-017",
      city: "Eugene",
      state: "OR",
      status: "Preconstruction",
      delivery_method: "GMP",
    },
    {
      id: 124516,
      name: "Lakeside Residential Tower",
      project_number: "BG-25-012",
      city: "Vancouver",
      state: "WA",
      status: "Active",
      delivery_method: "CM/GC",
    },
  ]

  return NextResponse.json({
    mock: true,
    connected: Boolean(token),
    company: { id: "bannett-procore-001", name: "The Bannett Group, LTD" },
    projects,
  })
}
