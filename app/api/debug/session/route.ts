import { cookies } from "next/headers";
import { unsealData } from "iron-session";
import { sessionOptions } from "@/lib/session";

export const runtime = "nodejs";

export async function GET() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(sessionOptions.cookieName);

  let unsealOk = false;
  let unsealError: string | null = null;
  let steamId: string | null = null;
  let isLoggedIn: boolean | null = null;

  if (raw?.value) {
    try {
      const data = await unsealData<{ steamId?: string; isLoggedIn?: boolean }>(raw.value, {
        password: sessionOptions.password,
        ttl: 60 * 60 * 24 * 14,
      });
      unsealOk = true;
      steamId = data.steamId ?? null;
      isLoggedIn = data.isLoggedIn ?? null;
    } catch (err) {
      unsealError = err instanceof Error ? err.message : String(err);
    }
  }

  return Response.json({
    hasCookie: !!raw,
    cookieLength: raw?.value.length ?? 0,
    unsealOk,
    unsealError,
    steamId,
    isLoggedIn,
  });
}
