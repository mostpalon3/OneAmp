import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prismaClient } from "@/app/lib/db";
const youtubesearchapi = require("youtube-search-api");

const YT_REGEX = /^(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com\/(?:watch\?(?!.*\blist=)(?:.*&)?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[?&]\S+)?$/;
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
        const isYt = data.url.match(YT_REGEX);
        if(!isYt){
          return NextResponse.json({
            message: "Only YouTube links are supported at the moment ,please enter a valid YouTube link"
          },{
            status: 411
          });
        }

        const extractedId = data.url.split("?v=")[1];
        console.log("Extracted ID:", extractedId);
        const res = await youtubesearchapi.GetVideoDetails(extractedId);
        console.log(res.title);
        console.log(JSON.stringify(res.thumbnail.thumbnails));
        const thumbnails = res.thumbnail.thumbnails;
        thumbnails.sort((a:{width:number}, b:{width:number}) => a.width < b.width ? -1 : 1);

        const stream = await prismaClient.stream.create({
          data : {
           title: res.title,
           userId: data.creatorId,
           url: data.url,
           extractedId,
           type: "YouTube",
           smallImg: (thumbnails.length > 1?thumbnails[thumbnails.length - 2].url:thumbnails[thumbnails.length - 1].url) ?? "https://i.pinimg.com/736x/22/f4/28/22f4285d816b01de00ebfd1dcc99fa72.jpg",
           bigImg: thumbnails[thumbnails.length - 1].url ?? "https://i.pinimg.com/736x/22/f4/28/22f4285d816b01de00ebfd1dcc99fa72.jpg",
        }
        });
        return NextResponse.json({
            message: "Stream added successfully",
            id: stream.id,
        },{
            status: 201
        });
    }catch(error){
        return NextResponse.json({
            message: "Error while adding a stream",
            error: error instanceof Error ? error.message : "Unknown error occurred"
        },{
            status: 411
        })
    }
}
 

export async function GET(req: NextRequest) {
  const creatorId = req.nextUrl.searchParams.get('creatorId');
  const streams = await prismaClient.stream.findMany({
    where: {
      userId: creatorId ?? ""
    }
  })

  return NextResponse.json({
    streams
  });
}