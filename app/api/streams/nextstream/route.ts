import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
        return NextResponse.json({
            message: "Unauthenticated"
        }, {
            status: 403
        });
    }

    //TODO: you can get rid of db call here
    const user = await prismaClient.user.findFirst({
        where: {
            email: session.user.email
        }
    });

    if (!user) {
        return NextResponse.json({
            message: "User not found"
        }, {
            status: 404
        });
    }

    const streams = await prismaClient.stream.findMany({
        where: {
            userId: user.id,
            played: false 
        },
        include: {
            _count: {
                select: {
                    upvotes: true,
                    downvotes: true
                }
            }
        }
    });

    if (streams.length === 0) {
        return NextResponse.json({
            message: "No streams found"
        }, {
            status: 404
        });
    }

    // Sort by net score (upvotes - downvotes) in JavaScript
    const mostUpVotedStream = streams.sort((a, b) => {
        const aNetScore = a._count.upvotes - a._count.downvotes;
        const bNetScore = b._count.upvotes - b._count.downvotes;
        return bNetScore - aNetScore; // Descending order
    })[0];

    try {
        // Mark the stream as played (but keep it for history)
        const updatedStream = await prismaClient.stream.update({
            where: {
                id: mostUpVotedStream.id
            },
            data: {
                played: true,
            }
        });

        // Update current stream to point to this stream
        await prismaClient.currentStream.upsert({
            where: { userId: user.id },
            update: {
                streamId: updatedStream.id
            },
            create: {
                userId: user.id,
                streamId: updatedStream.id
            }
        });

        return NextResponse.json({
            message: "Stream updated successfully",
            streamId: updatedStream.id,
            stream: updatedStream
        });
    } catch (error) {
        console.error("Database operation failed:", error);
        return NextResponse.json({
            message: "Internal server error"
        }, {
            status: 500
        });
    }
}