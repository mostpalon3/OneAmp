import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { StreamCacheService } from '@/app/lib/redis/stream-cache';

const DownvoteSchema = z.object({
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
        const data = DownvoteSchema.parse(await req.json());

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
            // Get user efficiently
            const user = await tx.user.findUnique({
                where: { email: userEmail },
                select: { id: true }
            });

            if (!user) {
                throw new Error("User not found");
            }

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

            if (existingDownvote) {
                // Remove downvote
                await tx.downvote.delete({
                    where: {
                        userId_streamId: {
                            userId: user.id,
                            streamId: data.streamId
                        }
                    }
                });
                return { action: "removed", message: "Downvote removed successfully" };
            } else {
                // Remove upvote if exists and add downvote
                const operations = [];
                
                if (existingUpvote) {
                    operations.push(
                        tx.upvote.delete({
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
                    tx.downvote.create({
                        data: {
                            userId: user.id,
                            streamId: data.streamId
                        }
                    })
                );

                await Promise.all(operations);
                return { action: "added", message: "Downvoted successfully" };
            }
        });

        // 🔥 REDIS INTEGRATION: Invalidate cache and publish real-time update
        await Promise.all([
            // Invalidate stream cache for this jam
            StreamCacheService.invalidateStreamCache(stream.jamId),
            
            // Invalidate user votes cache for this user
            StreamCacheService.invalidateUserVotes(userEmail, stream.jamId),
            
            // Publish real-time vote update
            StreamCacheService.publishVoteUpdate(stream.jamId, data.streamId, {
                action: result.action,
                type: 'downvote',
                userId: userEmail
            })
        ]);

        return NextResponse.json(result, { 
            status: result.action === "added" ? 201 : 200 
        });

    } catch (error) {
        console.error('Downvote error:', error);
        return NextResponse.json({
            message: "Error while processing downvote"
        }, { status: 500 });
    }
}