import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const callbackUrl = new URL("/api/procore/callback", url)

  // Mock OAuth: redirect immediately with a fake code.
  callbackUrl.searchParams.set("code", "mock_oauth_code")

  return NextResponse.redirect(callbackUrl)
}
