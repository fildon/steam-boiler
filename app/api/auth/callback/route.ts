import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  // TEMPORARY DIAGNOSTIC MODE — replace redirect with visible output
  const lines: string[] = [`url: ${request.url}`];
  try {
    const rawQuery = request.nextUrl.search.slice(1);
    const verifyBody = rawQuery.replace(/openid\.mode=[^&]*/, "openid.mode=check_authentication");
    const searchParams = request.nextUrl.searchParams;

    lines.push(`rawQuery length: ${rawQuery.length}`);

    const verifyRes = await fetch("https://steamcommunity.com/openid/login", {
      method: "POST",
      body: verifyBody,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    const verifyText = await verifyRes.text();
    lines.push(`verifyStatus: ${verifyRes.status}`);
    lines.push(`verifyBody: ${verifyText}`);

    const isValid = verifyText.includes("is_valid:true");
    const claimedId = searchParams.get("openid.claimed_id") ?? "";
    const steamId = claimedId.replace("https://steamcommunity.com/openid/id/", "");
    lines.push(`isValid: ${isValid}`);
    lines.push(`steamId: ${steamId}`);
    lines.push(`baseUrl: ${process.env.NEXT_PUBLIC_BASE_URL}`);

    if (isValid && steamId && /^\d+$/.test(steamId)) {
      const session = await getSession();
      session.steamId = steamId;
      session.isLoggedIn = true;
      await session.save();
      lines.push(`session saved: true`);
    }

    return new Response(lines.join("\n"), { status: 200, headers: { "Content-Type": "text/plain" } });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack ?? "" : "";
    lines.push(`EXCEPTION: ${message}`);
    lines.push(stack);
    return new Response(lines.join("\n"), { status: 500, headers: { "Content-Type": "text/plain" } });
  }
}
