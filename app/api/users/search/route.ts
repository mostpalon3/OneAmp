import { NextRequest, NextResponse } from "next/server";
import { prismaClient } from "@/app/lib/db";

// GET /api/users/search?q=username
export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get("q")?.trim();
    if (!q || q.length < 1) {
      return NextResponse.json({ users: [] });
    }

    const users = await prismaClient.profile.findMany({
      where: {
        OR: [
          { username: { contains: q, mode: "insensitive" } },
          { user: { name: { contains: q, mode: "insensitive" } } },
        ],
        profileCompleted: true,
      },
      select: {
        userId: true,
        username: true,
        image: true,
        favoriteGenre: true,
        followersCount: true,
        user: { select: { name: true } },
      },
      take: 10,
    });

    return NextResponse.json({
      users: users.map((p) => ({
        id: p.userId,
        username: p.username,
        name: p.user.name,
        avatar: p.image,
        favoriteGenre: p.favoriteGenre,
        followersCount: p.followersCount,
      })),
    });
  } catch (error) {
    console.error("User search error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
