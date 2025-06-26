import prismaClient from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const follower = await prismaClient.user.findUnique({
      where: { email: session.user.email }
    });

    if (!follower) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { userId: followingId } = await params;

    // Can't follow yourself
    if (follower.id === followingId) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    // Check if target user exists
    const targetUser = await prismaClient.user.findUnique({
      where: { id: followingId }
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    // Check if already following
    const existingFollow = await prismaClient.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: follower.id,
          followingId: followingId
        }
      }
    });

    if (existingFollow) {
      return NextResponse.json({ error: 'Already following' }, { status: 400 });
    }

    // Create follow relationship and update counts
    await prismaClient.$transaction([
      prismaClient.follow.create({
        data: {
          followerId: follower.id,
          followingId: followingId
        }
      }),
      // Update follower's following count
      prismaClient.profile.upsert({
        where: { userId: follower.id },
        create: {
          userId: follower.id,
          followingCount: 1
        },
        update: {
          followingCount: { increment: 1 }
        }
      }),
      // Update target user's followers count
      prismaClient.profile.upsert({
        where: { userId: followingId },
        create: {
          userId: followingId,
          followersCount: 1
        },
        update: {
          followersCount: { increment: 1 }
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      following: true
    });

  } catch (error) {
    console.error('Error following user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const follower = await prismaClient.user.findUnique({
      where: { email: session.user.email }
    });

    if (!follower) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { userId: followingId } = await params;

    // Check if follow relationship exists
    const existingFollow = await prismaClient.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: follower.id,
          followingId: followingId
        }
      }
    });

    if (!existingFollow) {
      return NextResponse.json({ error: 'Not following' }, { status: 400 });
    }

    // Remove follow relationship and update counts
    await prismaClient.$transaction([
      prismaClient.follow.delete({
        where: {
          followerId_followingId: {
            followerId: follower.id,
            followingId: followingId
          }
        }
      }),
      // Update follower's following count
      prismaClient.profile.update({
        where: { userId: follower.id },
        data: {
          followingCount: { decrement: 1 }
        }
      }),
      // Update target user's followers count
      prismaClient.profile.update({
        where: { userId: followingId },
        data: {
          followersCount: { decrement: 1 }
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      following: false
    });

  } catch (error) {
    console.error('Error unfollowing user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}