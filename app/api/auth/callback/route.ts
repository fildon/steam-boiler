import { type NextRequest } from "next/server";
import { sealData } from "iron-session";
import { sessionOptions, type SessionData } from "@/lib/session";

export const runtime = "nodejs";

const SESSION_TTL = 60 * 60 * 24 * 14; // 14 days

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

    const sessionCookie = [
      `${sessionOptions.cookieName}=${sealed}`,
      `Max-Age=${SESSION_TTL}`,
      `Path=/`,
      `HttpOnly`,
      `Secure`,
      `SameSite=Lax`,
    ].join("; ");

    // Non-HttpOnly probe cookie — readable via document.cookie in the browser.
    // If this appears in document.cookie, Set-Cookie is reaching the browser.
    // Remove once the session persistence issue is resolved.
    const probeCookie = `sb-probe=1; Max-Age=60; Path=/; SameSite=Lax`;

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head><body>
<pre id="out">checking cookies...</pre>
<script>
  document.getElementById('out').textContent =
    'document.cookie = ' + (document.cookie || '(empty)');
  setTimeout(function() { location.replace('/dashboard'); }, 4000);
</script>
</body></html>`;

    const headers = new Headers({
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    });
    headers.append("Set-Cookie", probeCookie);
    headers.append("Set-Cookie", sessionCookie);

    return new Response(html, { status: 200, headers });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(`Callback error: ${message}`, { status: 500 });
  }
}
