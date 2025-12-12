import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  // If Procore didn't send a code (e.g. user hit the URL directly)
  if (!code) {
    const redirectUrl = new URL("/procore-sync?error=no_code", url);
    return NextResponse.redirect(redirectUrl);
  }

  const tokenRes = await fetch(
    `${process.env.PROCORE_OAUTH_URL}/oauth/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: process.env.PROCORE_CLIENT_ID ?? "",
        client_secret: process.env.PROCORE_CLIENT_SECRET ?? "",
        redirect_uri: process.env.PROCORE_REDIRECT_URI ?? "",
      }),
    }
  );

  const data = await tokenRes.json();
  console.log("PROCORE TOKEN RESPONSE", data);

  if (!data.access_token) {
    const redirectUrl = new URL("/procore-sync?error=token_failed", url);
    return NextResponse.redirect(redirectUrl);
  }

  // TEMP: store access token in httpOnly cookie for testing
  const redirectUrl = new URL("/procore-test", url);
  const res = NextResponse.redirect(redirectUrl);
  res.cookies.set("procore_access_token", data.access_token, {
    httpOnly: true,
    secure: false,
    path: "/",
  });

  return res;
}
