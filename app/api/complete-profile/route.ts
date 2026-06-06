import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/lib/auth"
import { prismaClient } from "@/app/lib/db"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, username, favoriteGenre, profilePicture } = body

    if (!name?.trim() || !username?.trim() || !favoriteGenre) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const user = await prismaClient.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const existingProfile = await prismaClient.profile.findFirst({
      where: { username: username.toLowerCase(), NOT: { userId: user.id } },
    })
    if (existingProfile) return NextResponse.json({ error: "Username already taken" }, { status: 409 })

    const updatedUser = await prismaClient.user.update({
      where: { email: session.user.email },
      data: { name: name.trim(), image: profilePicture || session.user.image },
    })

    const profile = await prismaClient.profile.upsert({
      where: { userId: user.id },
      update: { username: username.toLowerCase().trim(), favoriteGenre, image: profilePicture || session.user.image || "", profileCompleted: true },
      create: { userId: user.id, username: username.toLowerCase().trim(), favoriteGenre, image: profilePicture || session.user.image || "", profileCompleted: true },
    })

    return NextResponse.json({
      message: "Profile completed successfully",
      user: { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, image: updatedUser.image },
      profile: { username: profile.username, favoriteGenre: profile.favoriteGenre, profileCompleted: profile.profileCompleted },
    })
  } catch (error) {
    console.error("Error completing profile:", error)
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const completedProfile = await prismaClient.profile.findFirst({
      where: { user: { email: session.user.email } },
      select: {
        id: true,
        userId: true,
        username: true,
        favoriteGenre: true,
        favoriteSinger: true,
        bio: true,
        spotifyUrl: true,
        followersCount: true,
        followingCount: true,
        profileCompleted: true,
        image: true,
        user: { select: { id: true, name: true, email: true, image: true } },
      },
    })

    if (!completedProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    const totalUserLikes = await prismaClient.jam.aggregate({
      where: { userId: completedProfile.userId },
      _sum: { likesCount: true },
    })

    return NextResponse.json({
      profile: completedProfile,
      user: completedProfile.user,
      totalUserLikes: totalUserLikes._sum.likesCount || 0,
    })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}