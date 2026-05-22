import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { serializeUser } from "@/lib/api/serializers";
import { serverError } from "@/lib/api/http";

export async function GET() {
  try {
    const user = await getCurrentUser();
    return NextResponse.json({ user: user ? serializeUser(user) : null });
  } catch (error) {
    return serverError(error);
  }
}
