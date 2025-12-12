import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const code = url.searchParams.get("code")

  // Mock OAuth: accept any code and set a mock access token cookie.
  if (!code) {
    const redirectUrl = new URL("/", url)
    redirectUrl.searchParams.set("procore", "error_no_code")
    return NextResponse.redirect(redirectUrl)
  }

  const redirectUrl = new URL("/", url)
  redirectUrl.searchParams.set("procore", "connected")

  const res = NextResponse.redirect(redirectUrl)
  res.cookies.set("procore_access_token", "mock_access_token", {
    httpOnly: true,
    secure: false,
    path: "/",
    sameSite: "lax",
  })

  return res
}
