import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/current-user";
import { serverError, unauthorized } from "@/lib/api/http";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    const { id } = await params;

    await prisma.discussion.deleteMany({ where: { id, userId: user.id } });
    await prisma.reaction.deleteMany({ where: { targetId: id, targetType: "discussion" } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return serverError(error);
  }
}
