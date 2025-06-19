import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const DownvoteSchema = z.object({
    streamId: z.string(),
})

export async function POST(req: NextRequest) {
    const session = await getServerSession();
    const user = await prismaClient.user.findFirst({
        where: {
            email: session?.user?.email ?? ""
        }
    });
    
    if(!user){
        return NextResponse.json({
            message: "Unauthenticated"
        },{
            status : 403
        });
    }

    try {
        const data = DownvoteSchema.parse(await req.json());
        
        // Check existing votes
        const existingUpvote = await prismaClient.upvote.findUnique({
            where: {
                userId_streamId: {
                    userId: user.id,
                    streamId: data.streamId
                }
            }
        });
        
        const existingDownvote = await prismaClient.downvote.findUnique({
            where: {
                userId_streamId: {
                    userId: user.id,
                    streamId: data.streamId
                }
            }
        });

        if (existingDownvote) {
            // User already downvoted, remove the downvote
            await prismaClient.downvote.delete({
                where: {
                    userId_streamId: {
                        userId: user.id,
                        streamId: data.streamId
                    }
                }
            });
            
            return NextResponse.json({
                message: "Downvote removed successfully",
                action: "removed"
            }, {
                status: 200
            });
        } else {
            // Remove upvote if exists
            if (existingUpvote) {
                await prismaClient.upvote.delete({
                    where: {
                        userId_streamId: {
                            userId: user.id,
                            streamId: data.streamId
                        }
                    }
                });
            }
            
            // Add downvote
            await prismaClient.downvote.create({
                data: {
                    userId: user.id,
                    streamId: data.streamId
                }
            });
            
            return NextResponse.json({
                message: "Downvoted successfully",
                action: "added"
            }, {
                status: 201
            });
        }
    } catch (e) {
        return NextResponse.json({
            message: "Error while processing downvote"
        }, {
            status: 500
        }); 
    }
}