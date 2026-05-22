import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { serializePublicProfile } from "@/lib/api/serializers";
import { serverError } from "@/lib/api/http";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const profile = await prisma.user.findUnique({ where: { id } });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const recentPosts = await prisma.discussion.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return NextResponse.json({
      profile: serializePublicProfile(profile),
      recentPosts: recentPosts.map((post) => ({
        id: post.id,
        content: post.content,
        media_title: post.mediaTitle,
        created_at: post.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    return serverError(error);
  }
}
