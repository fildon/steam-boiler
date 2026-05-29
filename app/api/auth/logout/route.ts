import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  session.destroy();
  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/`);
}
