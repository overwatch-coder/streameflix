import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/current-user";
import { serializePublicProfile, serializeUser } from "@/lib/api/serializers";
import { badRequest, serverError, unauthorized } from "@/lib/api/http";

const profileSchema = z.object({
  full_name: z.string().min(1).optional(),
  username: z.string().min(3).optional(),
  avatar_url: z.string().optional(),
  bio: z.string().optional(),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    return NextResponse.json({ user: serializeUser(user), profile: serializePublicProfile(user) });
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const parsed = profileSchema.safeParse(await request.json());
    if (!parsed.success) return badRequest("Invalid profile details.");

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        fullName: parsed.data.full_name,
        username: parsed.data.username,
        avatarUrl: parsed.data.avatar_url,
        bio: parsed.data.bio,
      },
    });

    return NextResponse.json({
      user: serializeUser(updated),
      profile: serializePublicProfile(updated),
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return badRequest("That username is already taken.");
    }
    return serverError(error);
  }
}
