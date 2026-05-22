import { NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/current-user";
import { serializeUser } from "@/lib/api/serializers";
import { serverError, unauthorized } from "@/lib/api/http";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const dataUri = `data:${file.type};base64,${bytes.toString("base64")}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "streameflix/avatars",
      public_id: user.id,
      overwrite: true,
      resource_type: "image",
    });

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl: result.secure_url },
    });

    return NextResponse.json({
      avatar_url: result.secure_url,
      user: serializeUser(updated),
    });
  } catch (error) {
    return serverError(error);
  }
}
