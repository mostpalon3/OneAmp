import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prismaClient } from "@/app/lib/db";

const YT_REGEX = new RegExp("^https:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+(&[^\s]*)?$");
// const SPOTIFY_REGEX = new RegExp("^https:\/\/(open\.)?spotify\.com\/track\/[\w-]+$");


const CreateStreamSchema = z.object({
  creatorId: z.string(),
  url: z.string()
});

//   url: z.string().url().refine((val) => {
//     try {
//       const host = new URL(val).hostname;
//       const youtubeHosts = ["www.youtube.com", "youtube.com", "youtu.be"];
//       const spotifyHosts = ["www.spotify.com", "open.spotify.com", "spotify.com"];
//       return youtubeHosts.includes(host) || spotifyHosts.includes(host);
//     } catch {
//       return false; // Not a valid URL
//     }
//   }, {
//     message: "URL must be a valid YouTube or Spotify link",
//   }),
// });


export async function POST(req: NextRequest){
    try{
        const data = CreateStreamSchema.parse(await req.json());
        const isYt = YT_REGEX.test(data.url);
        if(!isYt){
          return NextResponse.json({
            message: "Only YouTube links are supported at the moment ,please enter a valid YouTube link"
          },{
            status: 411
          });
        }
        const extractedID = data.url.split("?v=")[1];

        await prismaClient.stream.create({
          data : {
           userId: data.creatorId,
           url: data.url,
           extractedID,
           type: "youtube"
        }
        });
    }catch(e){
        return NextResponse.json({
            message: "Error while adding a stream"
        },{
            status: 411
        })
    }
}

export async function GET(req: NextRequest) {
  
}