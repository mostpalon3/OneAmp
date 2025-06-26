import prismaClient from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { jamId: string } }
) {
  try {
    const { jamId } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const [likes, total] = await Promise.all([
      prismaClient.jamLike.findMany({
        where: { jamId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              profile: {
                select: {
                  username: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prismaClient.jamLike.count({
        where: { jamId }
      })
    ]);

    return NextResponse.json({
      likes,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Error fetching jam likes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}