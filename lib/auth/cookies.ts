import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { SESSION_COOKIE_NAME } from "./session";

export const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

function isSecureRequest(request?: Request) {
  if (!request) {
    return process.env.NODE_ENV === "production";
  }

  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedProto) {
    return forwardedProto.split(",")[0]?.trim() === "https";
  }

  return new URL(request.url).protocol === "https:";
}

export function sessionCookieOptions(request?: Request): Partial<ResponseCookie> {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureRequest(request),
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}

export function expiredSessionCookieOptions(
  request?: Request,
): Partial<ResponseCookie> {
  return {
    ...sessionCookieOptions(request),
    maxAge: 0,
  };
}
