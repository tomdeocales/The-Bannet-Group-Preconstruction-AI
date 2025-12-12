import { NextResponse } from "next/server"

export async function GET() {
  const params = new URLSearchParams({
    client_id: process.env.PROCORE_CLIENT_ID ?? "",
    response_type: "code",
    redirect_uri: process.env.PROCORE_REDIRECT_URI ?? "",
  })

  const url = `${process.env.PROCORE_OAUTH_URL}/oauth/authorize?${params.toString()}`
  return NextResponse.redirect(url)
}
