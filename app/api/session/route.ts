import { getSession } from "@/lib/session";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  return Response.json(
    { isLoggedIn: session.isLoggedIn ?? false, steamId: session.steamId ?? null },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } },
  );
}
