import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const session = await getServerSession();
    //TODO:u can get rid of db call here
    const user = await prismaClient.user.findFirst({
        where: {
            email: session?.user?.email ?? ""
        }
    });
    if (!user) {
        return NextResponse.json({
            message: "Unauthenticated"
        }, {
            status: 403
        });
    }

    const streams = await prismaClient.stream.findMany({
        where: {
            userId: user.id ?? ""
        },
        include: {
            _count: {
                select: {
                    upvotes: true,
                }
            },
            upvotes: {
                where: {
                    userId: user.id ?? ""
                }
            }
        }
    })

    return NextResponse.json({
        streams: streams.map((stream) => ({
            ...stream,
            upvotes: stream._count.upvotes, 
            hasUserVoted: stream.upvotes.length ? 1 : 0, // 1 if user has voted, 0 if not
        })),
    }, {
        status: 200
    });
}