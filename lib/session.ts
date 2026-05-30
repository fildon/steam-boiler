import { getIronSession } from "iron-session";
import { headers } from "next/headers";

export interface SessionData {
  steamId?: string;
  isLoggedIn: boolean;
}

export const sessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: "steam-boiler-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

export async function getSession() {
  const h = await headers();
  const cookieHeader = h.get("cookie") ?? "";
  const req = new Request("http://n", { headers: { cookie: cookieHeader } });
  const res = new Response();
  return getIronSession<SessionData>(req, res, sessionOptions);
}
