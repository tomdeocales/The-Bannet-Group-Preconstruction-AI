import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const procoreMode = process.env.PROCORE_MODE ?? "mock"
  const url = new URL(req.url)
  const code = url.searchParams.get("code")

  if (procoreMode === "mock") {
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

  if (!code) {
    const redirectUrl = new URL("/", url)
    redirectUrl.searchParams.set("procore", "error_no_code")
    return NextResponse.redirect(redirectUrl)
  }

  const clientId = process.env.PROCORE_CLIENT_ID
  const clientSecret = process.env.PROCORE_CLIENT_SECRET
  const oauthBase = process.env.PROCORE_OAUTH_URL
  const redirectUri = process.env.PROCORE_REDIRECT_URI

  if (!clientId || !clientSecret || !oauthBase || !redirectUri) {
    return NextResponse.json(
      { error: "Missing PROCORE_CLIENT_ID/PROCORE_CLIENT_SECRET/PROCORE_OAUTH_URL/PROCORE_REDIRECT_URI env vars" },
      { status: 500 },
    )
  }

  const tokenUrl = new URL("/oauth/token", oauthBase)
  const body = new URLSearchParams()
  body.set("grant_type", "authorization_code")
  body.set("client_id", clientId)
  body.set("client_secret", clientSecret)
  body.set("code", code)
  body.set("redirect_uri", redirectUri)

  const tokenRes = await fetch(tokenUrl.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  })

  const tokenData = (await tokenRes.json()) as { access_token?: string; refresh_token?: string; expires_in?: number }

  if (!tokenRes.ok || !tokenData.access_token) {
    const redirectUrl = new URL("/", url)
    redirectUrl.searchParams.set("procore", "error_token_exchange")
    return NextResponse.redirect(redirectUrl)
  }

  const redirectUrl = new URL("/", url)
  redirectUrl.searchParams.set("procore", "connected")

  const res = NextResponse.redirect(redirectUrl)
  res.cookies.set("procore_access_token", tokenData.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  })

  if (tokenData.refresh_token) {
    res.cookies.set("procore_refresh_token", tokenData.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    })
  }

  return res
}
