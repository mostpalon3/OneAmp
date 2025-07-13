import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prismaClient } from "@/app/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    const { searchParams } = new URL(req.url);
    const jamId = searchParams.get('jamId');

    console.log(`🔍 DEBUG - Session:`, {
      email: session?.user?.email,
      id: session?.user?.id,
      name: session?.user?.name
    });

    if (!session?.user?.email) {
      return NextResponse.json({
        error: "Not authenticated",
        session: null
      }, { status: 401 });
    }

    const user = await prismaClient.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, name: true }
    });

    if (!user) {
      return NextResponse.json({
        error: "User not found in database",
        sessionEmail: session.user.email
      }, { status: 404 });
    }

    let voteData = null;
    if (jamId) {
      // Get all votes for this user in this jam
      const [upvotes, downvotes] = await Promise.all([
        prismaClient.upvote.findMany({
          where: { userId: user.id },
          include: { stream: { select: { jamId: true, title: true } } }
        }),
        prismaClient.downvote.findMany({
          where: { userId: user.id },
          include: { stream: { select: { jamId: true, title: true } } }
        })
      ]);

      voteData = {
        upvotes: upvotes.filter(v => v.stream.jamId === jamId),
        downvotes: downvotes.filter(v => v.stream.jamId === jamId),
        allUpvotes: upvotes,
        allDownvotes: downvotes
      };
    }

    return NextResponse.json({
      session: {
        email: session.user.email,
        id: session.user.id,
        name: session.user.name
      },
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      sessionIdMatchesDb: session.user.id === user.id,
      voteData
    });

  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
