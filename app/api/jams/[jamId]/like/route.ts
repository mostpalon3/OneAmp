import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prismaClient from '@/app/lib/db';

const devId = "16a7dae2-d8fb-4743-8ba5-78555959eefd"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ jamId: string }> }
) {
  try {
    const session = await getServerSession();
    const isDev = process.env.NODE_ENV === 'development';
    if (!session?.user?.email && !isDev) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prismaClient.user.findUnique({
      where: { id: session?.user?.id || devId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { jamId } = await params;

    // Check if jam exists
    const jam = await prismaClient.jam.findUnique({
      where: { id: jamId }
    });

    if (!jam) {
      return NextResponse.json({ error: 'Jam not found' }, { status: 404 });
    }

    // Check if already liked
    const existingLike = await prismaClient.jamLike.findUnique({
      where: {
        userId_jamId: {
          userId: user.id,
          jamId: jamId
        }
      }
    });

    if (existingLike) {
      // If already liked, delete the like (toggle off)
      const [_, updatedJam] = await prismaClient.$transaction([
        prismaClient.jamLike.delete({
          where: {
            userId_jamId: {
              userId: user.id,
              jamId: jamId
            }
          }
        }),
        prismaClient.jam.update({
          where: { id: jamId },
          data: {
            likesCount: {
              decrement: 1
            }
          }
        })
      ]);

      return NextResponse.json({
        success: true,
        likesCount: updatedJam.likesCount,
        liked: false
      });
    }

    // Create like and update likes count
    const [_, updatedJam] = await prismaClient.$transaction([
      prismaClient.jamLike.create({
        data: {
          userId: user.id,
          jamId: jamId
        }
      }),
      prismaClient.jam.update({
        where: { id: jamId },
        data: {
          likesCount: {
            increment: 1
          }
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      likesCount: updatedJam.likesCount,
      liked: true
    });

  } catch (error) {
    console.error('Error liking jam:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jamId: string }> }
) {
  try {
    const session = await getServerSession();
    const isDev = process.env.NODE_ENV === 'development';
    if (!session?.user?.email && !isDev) {
      return NextResponse.json({ liked: false });
    }

    const currentUser = await prismaClient.user.findUnique({
      where: { id: session?.user?.id || devId }
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
      likesCount: jam?.likesCount || 0,
    //   totalUserLikes: totalUserLikes,
    });

  } catch (error) {
    console.error('Error checking like status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
