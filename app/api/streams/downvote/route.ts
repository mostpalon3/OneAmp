import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const DownvoteSchema = z.object({
    streamId: z.string(),
})

export async function POST(req: NextRequest) {
    const session = await getServerSession();
    //TODO:u can get rid of db call here
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
        
        // Check if user has already voted
        const existingVote = await prismaClient.upvote.findUnique({
            where: {
                userId_streamId: {
                    userId: user.id,
                    streamId: data.streamId
                }
            }
        });

        if (existingVote) {
            // User had upvoted, remove the upvote (this acts as a downvote)
            await prismaClient.upvote.delete({
                where: {
                    userId_streamId: {
                        userId: user.id,
                        streamId: data.streamId
                    }
                }
            });
            
            return NextResponse.json({
                message: "Upvote removed (downvoted)",
                action: "removed_upvote"
            }, {
                status: 200
            });
        } else {
            // User hasn't voted, this downvote doesn't affect the database
            // since you're only tracking upvotes in the database
            return NextResponse.json({
                message: "No upvote to remove",
                action: "no_action"
            }, {
                status: 200
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