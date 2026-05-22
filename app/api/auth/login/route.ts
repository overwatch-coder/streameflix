import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { sessionCookieOptions } from "@/lib/auth/cookies";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { serializeUser } from "@/lib/api/serializers";
import { badRequest, serverError } from "@/lib/api/http";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const parsed = loginSchema.safeParse(await request.json());

    if (!parsed.success) {
      return badRequest("Please provide a valid email and password.");
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase().trim() },
    });

    if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    const token = await createSessionToken({ userId: user.id, email: user.email });
    const response = NextResponse.json({ user: serializeUser(user) });
    response.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieOptions(request));
    return response;
  } catch (error) {
    return serverError(error);
  }
}
