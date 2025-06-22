import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

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