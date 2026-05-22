import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";

export const SESSION_COOKIE_NAME = "streameflix_session";

export interface SessionPayload {
  userId: string;
  email: string;
}

const encoder = new TextEncoder();

function getSecret() {
  const secret =
    process.env.AUTH_SECRET ||
    (process.env.NODE_ENV === "test"
      ? "test-secret-at-least-thirty-two-characters"
      : "");

  if (!secret) {
    throw new Error("AUTH_SECRET is required");
  }

  return encoder.encode(secret);
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());
}

export async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify(token, getSecret());

  if (typeof payload.userId !== "string" || typeof payload.email !== "string") {
    return null;
  }

  return {
    userId: payload.userId,
    email: payload.email,
  };
}
