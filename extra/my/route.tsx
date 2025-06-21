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
                    downvotes: true,
                }
            },
            upvotes: {
                where: {
                    userId: user.id ?? ""
                }
            },
            downvotes: {
                where: {
                    userId: user.id
                }
            }
        }
    });

    const streamsWithVotes = streams.map((stream: any) => ({
        ...stream,
        votes: stream._count.upvotes - stream._count.downvotes,
        userVoted: stream.upvotes.length > 0 ? "up" :
            stream.downvotes.length > 0 ? "down" : null
    }));

    return NextResponse.json({
        streams: streamsWithVotes
    });
}