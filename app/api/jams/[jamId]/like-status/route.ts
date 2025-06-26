import prismaClient from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jamId: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ liked: false });
    }

    const currentUser = await prismaClient.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return NextResponse.json({ liked: false });
    }

    const { jamId } = await params;

    const jamLike = await prismaClient.jamLike.findUnique({
      where: {
        userId_jamId: {
          userId: currentUser.id,
          jamId: jamId
        }
      }
    });

    const jam = await prismaClient.jam.findUnique({
      where: { id: jamId },
      select: { likesCount: true }
    });

    return NextResponse.json({
      liked: !!jamLike,
      likesCount: jam?.likesCount || 0
    });

  } catch (error) {
    console.error('Error checking like status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}