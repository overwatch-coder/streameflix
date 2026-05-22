import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { sessionCookieOptions } from "@/lib/auth/cookies";
import { serializeUser } from "@/lib/api/serializers";
import { badRequest, serverError } from "@/lib/api/http";

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

function usernameFromEmail(email: string) {
  return email
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 24);
}

async function createUniqueUsername(email: string) {
  const base = usernameFromEmail(email) || "user";
  let username = base.length >= 3 ? base : `${base}_user`;
  let suffix = 1;

  while (await prisma.user.findUnique({ where: { username } })) {
    username = `${base}_${suffix}`;
    suffix += 1;
  }

  return username;
}

export async function POST(request: Request) {
  try {
    const parsed = registerSchema.safeParse(await request.json());

    if (!parsed.success) {
      return badRequest("Please provide a valid name, email, and password.");
    }

    const email = parsed.data.email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      return badRequest("An account with this email already exists.");
    }

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: await hashPassword(parsed.data.password),
        fullName: parsed.data.name.trim(),
        username: await createUniqueUsername(email),
        avatarUrl: "/placeholder.svg?height=40&width=40",
      },
    });

    const token = await createSessionToken({ userId: user.id, email: user.email });
    const response = NextResponse.json({ user: serializeUser(user) });
    response.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieOptions());
    return response;
  } catch (error) {
    return serverError(error);
  }
}
