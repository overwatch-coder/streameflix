import { NextResponse } from "next/server";
import type { Discussion, Reaction } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/current-user";
import { serializeDiscussion } from "@/lib/api/serializers";
import { badRequest, serverError, unauthorized } from "@/lib/api/http";

const discussionSchema = z.object({
  content: z.string().min(1),
  media_id: z.string().nullable().optional(),
  media_type: z.enum(["movie", "tv"]).nullable().optional(),
  media_title: z.string().nullable().optional(),
  media_poster: z.string().nullable().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get("media_id");
    const mediaType = searchParams.get("media_type") as "movie" | "tv" | null;
    const limit = Number(searchParams.get("limit") || 0);

    const discussions = await prisma.discussion.findMany({
      where: mediaId && mediaType ? { mediaId, mediaType } : undefined,
      include: {
        user: true,
        replies: { include: { user: true }, orderBy: { createdAt: "asc" } },
      },
      orderBy: { createdAt: "desc" },
      take: limit || undefined,
    });

    const reactions = await prisma.reaction.findMany({
      where: {
        targetType: "discussion",
        targetId: { in: discussions.map((discussion: Discussion) => discussion.id) },
      },
    });

    const withReactions = discussions.map((discussion) => ({
      ...discussion,
      reactions: reactions.filter(
        (reaction: Reaction) => reaction.targetId === discussion.id,
      ),
    }));

    return NextResponse.json({ discussions: withReactions.map(serializeDiscussion) });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    const parsed = discussionSchema.safeParse(await request.json());
    if (!parsed.success) return badRequest("Discussion content is required.");

    const discussion = await prisma.discussion.create({
      data: {
        userId: user.id,
        content: parsed.data.content,
        mediaId: parsed.data.media_id,
        mediaType: parsed.data.media_type,
        mediaTitle: parsed.data.media_title,
        mediaPoster: parsed.data.media_poster,
      },
      include: { user: true, replies: { include: { user: true } } },
    });

    return NextResponse.json({ discussion: serializeDiscussion({ ...discussion, reactions: [] }) });
  } catch (error) {
    return serverError(error);
  }
}
