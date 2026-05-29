import { NextResponse } from "next/server";
import { sessionOptions } from "@/lib/session";

export const runtime = "nodejs";

export async function GET() {
  const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/`);
  response.cookies.set(sessionOptions.cookieName, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}
