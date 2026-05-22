import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/current-user";
import { badRequest, serverError, unauthorized } from "@/lib/api/http";

const reactionSchema = z.object({
  target_id: z.string(),
  target_type: z.enum(["discussion", "review", "comment", "discussion_reply", "review_reply"]),
  type: z.enum(["like", "dislike"]),
});

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    const parsed = reactionSchema.safeParse(await request.json());
    if (!parsed.success) return badRequest("Invalid reaction details.");

    const existing = await prisma.reaction.findUnique({
      where: {
        userId_targetId_targetType: {
          userId: user.id,
          targetId: parsed.data.target_id,
          targetType: parsed.data.target_type,
        },
      },
    });

    if (existing?.type === parsed.data.type) {
      await prisma.reaction.delete({ where: { id: existing.id } });
      return NextResponse.json({ reaction: null });
    }

    const reaction = existing
      ? await prisma.reaction.update({
          where: { id: existing.id },
          data: { type: parsed.data.type },
        })
      : await prisma.reaction.create({
          data: {
            userId: user.id,
            targetId: parsed.data.target_id,
            targetType: parsed.data.target_type,
            type: parsed.data.type,
          },
        });

    return NextResponse.json({ reaction });
  } catch (error) {
    return serverError(error);
  }
}
