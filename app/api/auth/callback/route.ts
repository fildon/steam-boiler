import { type NextRequest, NextResponse } from "next/server";
import { sealData } from "iron-session";
import { sessionOptions, type SessionData } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    // Use the raw query string rather than URLSearchParams to avoid URLSearchParams
    // decoding '+' as a space — openid.sig is base64 and contains literal '+' characters
    // that must be preserved exactly as-is for Steam's signature verification.
    const rawQuery = request.nextUrl.search.slice(1); // strip leading '?'
    const verifyBody = rawQuery
      .replace(/openid\.mode=[^&]*/, "openid.mode=check_authentication");

    const searchParams = request.nextUrl.searchParams;

    const verifyRes = await fetch("https://steamcommunity.com/openid/login", {
      method: "POST",
      body: verifyBody,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const verifyText = await verifyRes.text();
    if (!verifyText.includes("is_valid:true")) {
      return new Response(`Steam verification failed. Response: ${verifyText}`, { status: 401 });
    }

    // SteamID is the numeric suffix of the claimed_id URL
    const claimedId = searchParams.get("openid.claimed_id") ?? "";
    const steamId = claimedId.replace("https://steamcommunity.com/openid/id/", "");
    if (!steamId || !/^\d+$/.test(steamId)) {
      return new Response(`Invalid SteamID extracted from: ${claimedId}`, { status: 400 });
    }

    // Seal the session data directly and set the cookie on the redirect response.
    // iron-session's session.save() calls cookies().set() from next/headers, which
    // Next.js does not reliably propagate into NextResponse.redirect() responses —
    // the Set-Cookie header gets dropped and the session never persists.
    const sessionData: SessionData = { steamId, isLoggedIn: true };
    const sealed = await sealData(sessionData, { password: sessionOptions.password });
    const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`);
    response.cookies.set(sessionOptions.cookieName, sealed, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 14, // 14 days
      path: "/",
    });
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(`Callback error: ${message}`, { status: 500 });
  }
}
