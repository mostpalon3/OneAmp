import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { StreamCacheService } from '@/app/lib/redis/stream-cache';

const UpvoteSchema = z.object({
    streamId: z.string(),
});

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession();
        
        if (!session?.user?.email) {
            return NextResponse.json({
                message: "Unauthenticated"
            }, { status: 403 });
        }

        const userEmail = session.user.email;
        const data = UpvoteSchema.parse(await req.json());

        // Get user before transaction so it's available outside
        const user = await prismaClient.user.findUnique({
            where: { email: userEmail },
            select: { id: true }
        });

        if (!user) {
            return NextResponse.json({
                message: "User not found"
            }, { status: 404 });
        }

        // Get jamId from the stream
        const stream = await prismaClient.stream.findUnique({
            where: { id: data.streamId },
            select: { jamId: true }
        });

        if (!stream) {
            return NextResponse.json({
                message: "Stream not found"
            }, { status: 404 });
        }

        const result = await prismaClient.$transaction(async (tx) => {
            // user is already fetched above

            // Check existing votes in parallel
            const [existingUpvote, existingDownvote] = await Promise.all([
                tx.upvote.findUnique({
                    where: {
                        userId_streamId: {
                            userId: user.id,
                            streamId: data.streamId
                        }
                    }
                }),
                tx.downvote.findUnique({
                    where: {
                        userId_streamId: {
                            userId: user.id,
                            streamId: data.streamId
                        }
                    }
                })
            ]);

            if (existingUpvote) {
                // Remove upvote
                await tx.upvote.delete({
                    where: {
                        userId_streamId: {
                            userId: user.id,
                            streamId: data.streamId
                        }
                    }
                });
                return { action: "removed", message: "Upvote removed successfully" };
            } else {
                // Remove downvote if exists and add upvote
                const operations = [];
                
                if (existingDownvote) {
                    operations.push(
                        tx.downvote.delete({
                            where: {
                                userId_streamId: {
                                    userId: user.id,
                                    streamId: data.streamId
                                }
                            }
                        })
                    );
                }
                
                operations.push(
                    tx.upvote.create({
                        data: {
                            userId: user.id,
                            streamId: data.streamId
                        }
                    })
                );

                await Promise.all(operations);
                return { action: "added", message: "Upvoted successfully" };
            }
        });

        // 🔥 COMPREHENSIVE CACHE INVALIDATION
        await Promise.all([
            // Clear ALL caches for this jam
            StreamCacheService.invalidateAllUserCachesForJam(stream.jamId),
            // Publish real-time update to all connected clients
            StreamCacheService.publishVoteUpdate(stream.jamId, data.streamId, {
                action: result.action,
                type: 'upvote',
                userId: user.id,
                timestamp: Date.now()
            }),
            // Also publish a general stream update
            StreamCacheService.publishStreamUpdate(stream.jamId, {
                type: 'vote_changed',
                streamId: data.streamId,
                userId: user.id,
                action: result.action,
                voteType: 'upvote',
                timestamp: Date.now()
            })
        ]);

        return NextResponse.json(result, { 
            status: result.action === "added" ? 201 : 200 
        });

    } catch (error) {
        console.error('Upvote error:', error);
        return NextResponse.json({
            message: "Error while processing upvote"
        }, { status: 500 });
    }
}