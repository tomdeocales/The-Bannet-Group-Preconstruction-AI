import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const procoreMode = process.env.PROCORE_MODE ?? "mock"
  const url = new URL(req.url)

  if (procoreMode === "mock") {
    const callbackUrl = new URL("/api/procore/callback", url)
    // Mock OAuth: redirect immediately with a fake code.
    callbackUrl.searchParams.set("code", "mock_oauth_code")
    return NextResponse.redirect(callbackUrl)
  }

  const clientId = process.env.PROCORE_CLIENT_ID
  const oauthBase = process.env.PROCORE_OAUTH_URL
  const redirectUri = process.env.PROCORE_REDIRECT_URI

  if (!clientId || !oauthBase || !redirectUri) {
    return NextResponse.json(
      { error: "Missing PROCORE_CLIENT_ID/PROCORE_OAUTH_URL/PROCORE_REDIRECT_URI env vars" },
      { status: 500 },
    )
  }

  const authUrl = new URL("/oauth/authorize", oauthBase)
  authUrl.searchParams.set("client_id", clientId)
  authUrl.searchParams.set("response_type", "code")
  authUrl.searchParams.set("redirect_uri", redirectUri)
  authUrl.searchParams.set("state", `bannett_${Date.now()}`)

  return NextResponse.redirect(authUrl)
}
