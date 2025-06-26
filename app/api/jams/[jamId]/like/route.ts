import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prismaClient from '@/app/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { jamId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prismaClient.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { jamId } = params;

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
      return NextResponse.json({ error: 'Already liked' }, { status: 400 });
    }

    // Create like and update likes count
    const [jamLike, updatedJam] = await prismaClient.$transaction([
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { jamId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prismaClient.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { jamId } = params;

    // Check if like exists
    const existingLike = await prismaClient.jamLike.findUnique({
      where: {
        userId_jamId: {
          userId: user.id,
          jamId: jamId
        }
      }
    });

    if (!existingLike) {
      return NextResponse.json({ error: 'Not liked yet' }, { status: 400 });
    }

    // Remove like and update likes count
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

  } catch (error) {
    console.error('Error unliking jam:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}