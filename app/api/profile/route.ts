import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prismaClient } from "@/app/lib/db";
import { authOptions } from "@/app/lib/auth";

// GET /api/profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prismaClient.profile.findFirst({
      where: { user: { email: session.user.email } },
      include: { user: { select: { id: true, name: true, email: true, image: true } } },
    });

    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    return NextResponse.json({ profile });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/profile
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { bio, favoriteGenre, favoriteSinger, spotifyUrl, username, name, image } = body;

    const user = await prismaClient.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Check username uniqueness
    if (username) {
      const existing = await prismaClient.profile.findFirst({
        where: { username: username.toLowerCase(), NOT: { userId: user.id } },
      });
      if (existing) return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }

    // Validate Spotify URL
    if (spotifyUrl && spotifyUrl.trim() !== "") {
      if (!spotifyUrl.includes("spotify.com")) {
        return NextResponse.json({ error: "Please enter a valid Spotify URL" }, { status: 400 });
      }
    }

    // Build update data
    const profileData: Record<string, any> = {};
    if (bio !== undefined) profileData.bio = bio.trim();
    if (favoriteGenre) profileData.favoriteGenre = favoriteGenre;
    if (favoriteSinger !== undefined) profileData.favoriteSinger = favoriteSinger.trim();
    if (spotifyUrl !== undefined) profileData.spotifyUrl = spotifyUrl.trim() || null;
    if (username) profileData.username = username.toLowerCase().trim();
    if (image) profileData.image = image;

    // Update user name and/or image
    const userUpdate: Record<string, any> = {};
    if (name) userUpdate.name = name.trim();
    if (image) userUpdate.image = image;
    if (Object.keys(userUpdate).length > 0) {
      await prismaClient.user.update({ where: { id: user.id }, data: userUpdate });
    }

    const updatedProfile = await prismaClient.profile.update({
      where: { userId: user.id },
      data: profileData,
      include: { user: { select: { id: true, name: true, email: true, image: true } } },
    });

    return NextResponse.json({ profile: updatedProfile, message: "Profile updated" });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
