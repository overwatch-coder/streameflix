import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/current-user";
import { serializeWatchHistory } from "@/lib/api/serializers";
import { badRequest, serverError, unauthorized } from "@/lib/api/http";

const historySchema = z.object({
  media_id: z.string(),
  media_type: z.enum(["movie", "tv"]),
  title: z.string().optional(),
  poster_path: z.string().nullable().optional(),
  season_number: z.number().nullable().optional(),
  episode_number: z.number().nullable().optional(),
  progress: z.number().default(0),
  duration: z.number().default(0),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    const items = await prisma.watchHistoryItem.findMany({
      where: { userId: user.id },
      orderBy: { lastWatchedAt: "desc" },
    });
    return NextResponse.json({ history: items.map(serializeWatchHistory) });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    const parsed = historySchema.safeParse(await request.json());
    if (!parsed.success) return badRequest("Invalid watch history item.");

    const item = await prisma.watchHistoryItem.upsert({
      where: {
        userId_mediaId_mediaType: {
          userId: user.id,
          mediaId: parsed.data.media_id,
          mediaType: parsed.data.media_type,
        },
      },
      update: {
        title: parsed.data.title,
        posterPath: parsed.data.poster_path,
        seasonNumber: parsed.data.season_number,
        episodeNumber: parsed.data.episode_number,
        progress: parsed.data.progress,
        duration: parsed.data.duration,
        lastWatchedAt: new Date(),
      },
      create: {
        userId: user.id,
        mediaId: parsed.data.media_id,
        mediaType: parsed.data.media_type,
        title: parsed.data.title,
        posterPath: parsed.data.poster_path,
        seasonNumber: parsed.data.season_number,
        episodeNumber: parsed.data.episode_number,
        progress: parsed.data.progress,
        duration: parsed.data.duration,
      },
    });

    return NextResponse.json({ historyItem: serializeWatchHistory(item) });
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get("media_id");
    if (!mediaId) return badRequest("media_id is required.");

    await prisma.watchHistoryItem.deleteMany({ where: { userId: user.id, mediaId } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return serverError(error);
  }
}
