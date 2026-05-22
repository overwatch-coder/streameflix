import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/current-user";
import { badRequest, serverError, unauthorized } from "@/lib/api/http";

const replySchema = z.object({
  content: z.string().min(1),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    const parsed = replySchema.safeParse(await request.json());
    if (!parsed.success) return badRequest("Reply content is required.");
    const { id } = await params;

    const reply = await prisma.discussionReply.create({
      data: { discussionId: id, userId: user.id, content: parsed.data.content },
      include: { user: true },
    });

    return NextResponse.json({
      reply: {
        id: reply.id,
        discussion_id: reply.discussionId,
        user_id: reply.userId,
        content: reply.content,
        created_at: reply.createdAt.toISOString(),
        profiles: {
          username: reply.user.username,
          avatar_url: reply.user.avatarUrl,
          full_name: reply.user.fullName,
        },
      },
    });
  } catch (error) {
    return serverError(error);
  }
}
