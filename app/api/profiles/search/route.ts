import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { serializePublicProfile } from "@/lib/api/serializers";
import { serverError } from "@/lib/api/http";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();

    const users = await prisma.user.findMany({
      where: query
        ? {
            OR: [
              { username: { contains: query, mode: "insensitive" } },
              { fullName: { contains: query, mode: "insensitive" } },
            ],
          }
        : undefined,
      take: 20,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ profiles: users.map(serializePublicProfile) });
  } catch (error) {
    return serverError(error);
  }
}
