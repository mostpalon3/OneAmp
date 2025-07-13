import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { VoteSyncService } from '@/app/lib/redis/vote-sync';

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

        // 🔥 NEW: Get user BEFORE transaction
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

        // 🔥 Get updated vote counts for verification
        const updatedCounts = await prismaClient.stream.findUnique({
            where: { id: data.streamId },
            select: {
                _count: {
                    select: {
                        upvotes: true,
                        downvotes: true
                    }
                }
            }
        });

        const totalVotes = (updatedCounts?._count.upvotes || 0) - (updatedCounts?._count.downvotes || 0);        

        // 🔥 VOTE SYNC: Use new vote synchronization service
        await VoteSyncService.forceVoteSync(stream.jamId, data.streamId, user.id, {
            type: result.action === "added" ? "downvote" : "remove_downvote",
            action: result.action,
            userId: user.id,
            timestamp: Date.now(),
            newVoteCount: totalVotes
        });

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