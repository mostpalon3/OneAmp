import { NextRequest, NextResponse } from "next/server";
import { prismaClient } from "@/app/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const followers = await prismaClient.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
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
      followers: followers.map((f) => ({
        id: f.follower.id,
        name: f.follower.name,
        username: f.follower.profile?.username,
        avatar: f.follower.profile?.image || f.follower.image,
        favoriteGenre: f.follower.profile?.favoriteGenre,
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}