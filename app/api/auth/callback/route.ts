import { type NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Re-post all params back to Steam to verify the assertion
  const verifyParams = new URLSearchParams();
  searchParams.forEach((value, key) => verifyParams.set(key, value));
  verifyParams.set("openid.mode", "check_authentication");

  const verifyRes = await fetch("https://steamcommunity.com/openid/login", {
    method: "POST",
    body: verifyParams,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  const verifyText = await verifyRes.text();
  if (!verifyText.includes("is_valid:true")) {
    return new Response("Steam authentication failed", { status: 401 });
  }

  // SteamID is the numeric suffix of the claimed_id URL
  const claimedId = searchParams.get("openid.claimed_id") ?? "";
  const steamId = claimedId.replace("https://steamcommunity.com/openid/id/", "");
  if (!steamId || !/^\d+$/.test(steamId)) {
    return new Response("Invalid SteamID", { status: 400 });
  }

  const session = await getSession();
  session.steamId = steamId;
  session.isLoggedIn = true;
  await session.save();

  redirect("/dashboard");
}
