import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { expiredSessionCookieOptions } from "@/lib/auth/cookies";

export async function POST(request: Request) {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, "", expiredSessionCookieOptions(request));
  return response;
}
