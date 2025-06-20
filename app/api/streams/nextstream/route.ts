import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession();
        
        if (!session?.user?.email) {
            return NextResponse.json({
                message: "Unauthenticated"
            }, {
                status: 403
            });
        }

        // Get user from session
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

        // Get all unplayed streams for this user
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
            // No more songs in queue - clear current stream (if exists)
            const existingCurrentStream = await prismaClient.currentStream.findUnique({
                where: {
                    userId: user.id
                }
            });

            if (existingCurrentStream) {
                await prismaClient.currentStream.delete({
                    where: {
                        userId: user.id
                    }
                });
            }

            return NextResponse.json({
                message: "Queue is empty - reset to fallback",
                queueEmpty: true
            }, {
                status: 200
            });
        }

        // Sort by net score (upvotes - downvotes) in descending order
        const mostUpVotedStream = streams.sort((a, b) => {
            const aNetScore = a._count.upvotes - a._count.downvotes;
            const bNetScore = b._count.upvotes - b._count.downvotes;
            return bNetScore - aNetScore;
        })[0];

        // Mark the current stream as played
        const updatedStream = await prismaClient.stream.update({
            where: {
                id: mostUpVotedStream.id
            },
            data: {
                played: true,
            }
        });

        // Update or create current stream pointer
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
            message: "Next stream playing successfully",
            streamId: updatedStream.id,
            stream: updatedStream,
            queueEmpty: false
        });

    } catch (error) {
        console.error("Next stream error:", error);
        return NextResponse.json({
            message: "Failed to play next stream",
            error: error instanceof Error ? error.message : "Unknown error"
        }, {
            status: 500
        });
    }
}

// Also support POST method for consistency
export async function POST(req: NextRequest) {
    return GET(req);
}