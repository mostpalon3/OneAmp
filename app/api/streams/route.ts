import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prismaClient } from "@/app/lib/db";


const CreateStreamSchema = z.object({
  creatorId: z.string(),
  url: z.string().url().refine((val) => {
    try {
      const host = new URL(val).hostname;
      const youtubeHosts = ["www.youtube.com", "youtube.com", "youtu.be"];
      const spotifyHosts = ["www.spotify.com", "open.spotify.com", "spotify.com"];
      return youtubeHosts.includes(host) || spotifyHosts.includes(host);
    } catch {
      return false; // Not a valid URL
    }
  }, {
    message: "URL must be a valid YouTube or Spotify link",
  }),
});


export async function POST(req: NextRequest){
    try{
        const data = CreateStreamSchema.parse(await req.json());
        prismaClient.stream.create({
           userId: data.creatorId,
        })
    }catch(e){
        return NextResponse.json({
            message: "Error while adding a stream"
        },{
            status: 411
        })
    }
}