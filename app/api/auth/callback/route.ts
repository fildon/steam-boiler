import { type NextRequest, NextResponse } from "next/server";
import { sealData } from "iron-session";
import { sessionOptions, type SessionData } from "@/lib/session";

export const runtime = "nodejs";

const SESSION_TTL = 60 * 60 * 24 * 14; // 14 days — matches iron-session default

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

    const sessionData: SessionData = { steamId, isLoggedIn: true };
    const sealed = await sealData(sessionData, { password: sessionOptions.password, ttl: SESSION_TTL });

    // Return a 200 HTML page rather than a redirect for two reasons:
    //   1. Netlify's CDN strips Set-Cookie from redirect responses, so the session
    //      cookie never reaches the browser when we use NextResponse.redirect().
    //   2. location.replace('/dashboard') rewrites the history entry, so the browser
    //      URL becomes /dashboard with no openid query params left behind.
    const response = new NextResponse(
      `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body><script>location.replace('/dashboard');</script></body></html>`,
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } }
    );
    response.cookies.set(sessionOptions.cookieName, sealed, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: SESSION_TTL,
      path: "/",
    });
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(`Callback error: ${message}`, { status: 500 });
  }
}
