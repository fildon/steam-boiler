import { type NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Visit once: sets a plain cookie. Visit again: confirms the browser sent it back.
export async function GET(request: NextRequest) {
  const existing = request.cookies.get("debug-cookie");

  if (existing) {
    return Response.json({
      found: true,
      value: existing.value,
      allCookieNames: request.cookies.getAll().map((c) => c.name),
    });
  }

  const response = NextResponse.json({
    found: false,
    message: "Cookie set. Visit this URL again to verify the browser sends it back.",
    allCookieNames: request.cookies.getAll().map((c) => c.name),
  });
  response.cookies.set("debug-cookie", "hello-world", {
    maxAge: 300,
    path: "/",
    sameSite: "lax",
  });
  return response;
}
