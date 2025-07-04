import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { StreamCacheService } from '@/app/lib/redis/stream-cache';

export async function GET(req: NextRequest,{ params }: { params: Promise<{ jamId: string }>} ) {
    try {
        const session = await getServerSession();
        const resolvedParams = await params; // ✅ Await the params
        const jamId = String(resolvedParams.jamId);
        
        if (!session?.user?.email) {
            return NextResponse.json({
                message: "Unauthenticated"
            }, {
                status: 403
            });
        }

        // Get all unplayed streams for this user
        const streams = await prismaClient.stream.findMany({
            where: {
                jamId: jamId,
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
                    jamId: jamId
                }
            });

            if (existingCurrentStream) {
                await prismaClient.currentStream.delete({
                    where: {
                        jamId: jamId,
                    }
                });
            }

            // Invalidate cache when queue becomes empty
            await StreamCacheService.invalidateStreamCache(jamId);

            return NextResponse.json({
                message: "Queue is empty - reset to fallback",
                queueEmpty: true
            }, {
                status: 200
            });
        }

        // Sort by net score (upvotes - downvotes) in descending order
        const mostUpVotedStream = streams.sort((a: any, b: any) => {
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
            where: { jamId: jamId },
            update: {
                streamId: updatedStream.id
            },
            create: {
                jamId: jamId,
                streamId: updatedStream.id
            }
        });

        // 🔥 KEY FIX: Invalidate cache after database changes
        await StreamCacheService.invalidateStreamCache(jamId);
        
        // 🔥 OPTIONAL: Publish real-time update
        await StreamCacheService.publishStreamUpdate(jamId, {
            type: 'next_stream',
            newActiveStreamId: updatedStream.id,
            queueEmpty: false
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

