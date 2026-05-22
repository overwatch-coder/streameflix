import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { SESSION_COOKIE_NAME } from "./session";

export const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

export function sessionCookieOptions(): Partial<ResponseCookie> {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}

export function expiredSessionCookieOptions(): Partial<ResponseCookie> {
  return {
    ...sessionCookieOptions(),
    maxAge: 0,
  };
}
