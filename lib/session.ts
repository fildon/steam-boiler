import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

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
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}
