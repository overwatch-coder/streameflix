import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/current-user";
import { serializeReview } from "@/lib/api/serializers";
import { badRequest, serverError, unauthorized } from "@/lib/api/http";

const reviewSchema = z.object({
  media_id: z.string(),
  media_type: z.enum(["movie", "tv"]),
  media_title: z.string().nullable().optional(),
  media_poster: z.string().nullable().optional(),
  rating: z.number().min(1).max(10),
  content: z.string().min(1),
  season_number: z.number().nullable().optional(),
  episode_number: z.number().nullable().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get("media_id");
    const mediaType = searchParams.get("media_type") as "movie" | "tv" | null;
    const seasonNumber = searchParams.get("season_number");
    const episodeNumber = searchParams.get("episode_number");

    if (!mediaId || !mediaType) return badRequest("media_id and media_type are required.");

    const reviews = await prisma.review.findMany({
      where: {
        mediaId,
        mediaType,
        ...(seasonNumber ? { seasonNumber: Number(seasonNumber) } : {}),
        ...(episodeNumber ? { episodeNumber: Number(episodeNumber) } : {}),
      },
      include: {
        user: true,
        replies: { include: { user: true }, orderBy: { createdAt: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    const reactions = await prisma.reaction.findMany({
      where: {
        targetType: "review",
        targetId: { in: reviews.map((review) => review.id) },
      },
    });

    const withReactions = reviews.map((review) => ({
      ...review,
      reactions: reactions.filter((reaction) => reaction.targetId === review.id),
    }));

    return NextResponse.json({ reviews: withReactions.map(serializeReview) });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    const parsed = reviewSchema.safeParse(await request.json());
    if (!parsed.success) return badRequest("Invalid review details.");

    const review = await prisma.review.create({
      data: {
        userId: user.id,
        mediaId: parsed.data.media_id,
        mediaType: parsed.data.media_type,
        mediaTitle: parsed.data.media_title,
        mediaPoster: parsed.data.media_poster,
        rating: parsed.data.rating,
        content: parsed.data.content,
        seasonNumber: parsed.data.season_number,
        episodeNumber: parsed.data.episode_number,
      },
      include: { user: true, replies: { include: { user: true } } },
    });

    return NextResponse.json({ review: serializeReview({ ...review, reactions: [] }) });
  } catch (error) {
    return serverError(error);
  }
}
