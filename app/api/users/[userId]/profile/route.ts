import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prismaClient } from "@/app/lib/db";
import { authOptions } from "@/app/lib/auth";

// GET /api/users/[userId]/profile - public profile view
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { userId } = await params;

    const profile = await prismaClient.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            Jam: {
              select: { id: true, title: true, genre: true, likesCount: true, createdAt: true },
              orderBy: { createdAt: "desc" },
              take: 6,
            },
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Check if current user is following this profile
    let isFollowing = false;
    if (session?.user?.email) {
      const currentUser = await prismaClient.user.findUnique({
        where: { email: session.user.email },
      });
      if (currentUser && currentUser.id !== userId) {
        const follow = await prismaClient.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: currentUser.id,
              followingId: userId,
            },
          },
        });
        isFollowing = !!follow;
      }
    }

    const jamCount = await prismaClient.jam.count({ where: { userId } });
    const totalLikes = await prismaClient.jam.aggregate({
      where: { userId },
      _sum: { likesCount: true },
    });

    return NextResponse.json({
      profile: {
        ...profile,
        isFollowing,
        jamCount,
        totalLikes: totalLikes._sum.likesCount || 0,
        recentJams: profile.user.Jam,
      },
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
