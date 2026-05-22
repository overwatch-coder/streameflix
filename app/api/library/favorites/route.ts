import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/current-user";
import { serializeLibraryItem } from "@/lib/api/serializers";
import { badRequest, serverError, unauthorized } from "@/lib/api/http";

const itemSchema = z.object({
  media_id: z.string(),
  media_type: z.enum(["movie", "tv"]),
  title: z.string().optional(),
  poster_path: z.string().nullable().optional(),
  vote_average: z.number().nullable().optional(),
  overview: z.string().nullable().optional(),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    const items = await prisma.favorite.findMany({ where: { userId: user.id } });
    return NextResponse.json({ favorites: items.map(serializeLibraryItem) });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    const parsed = itemSchema.safeParse(await request.json());
    if (!parsed.success) return badRequest("Invalid favorite item.");

    const item = await prisma.favorite.upsert({
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
        voteAverage: parsed.data.vote_average,
        overview: parsed.data.overview,
      },
      create: {
        userId: user.id,
        mediaId: parsed.data.media_id,
        mediaType: parsed.data.media_type,
        title: parsed.data.title,
        posterPath: parsed.data.poster_path,
        voteAverage: parsed.data.vote_average,
        overview: parsed.data.overview,
      },
    });

    return NextResponse.json({ favorite: serializeLibraryItem(item) });
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

    await prisma.favorite.deleteMany({ where: { userId: user.id, mediaId } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return serverError(error);
  }
}
