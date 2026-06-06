import { NextRequest, NextResponse } from "next/server";
import { prismaClient } from "@/app/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const following = await prismaClient.follow.findMany({
      where: { followerId: userId },
      include: {
        following: {
          select: {
            id: true,
            name: true,
            image: true,
            profile: { select: { username: true, image: true, favoriteGenre: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      following: following.map((f) => ({
        id: f.following.id,
        name: f.following.name,
        username: f.following.profile?.username,
        avatar: f.following.profile?.image || f.following.image,
        favoriteGenre: f.following.profile?.favoriteGenre,
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}