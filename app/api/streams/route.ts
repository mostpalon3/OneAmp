import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prismaClient } from "@/app/lib/db";
const youtubesearchapi = require("youtube-search-api");

// Updated regex to support both regular videos and playlist videos
const YT_REGEX = /^(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[?&]\S+)?$/;

const CreateStreamSchema = z.object({
  creatorId: z.string(),
  url: z.string()
});

// Helper function to extract video ID from various YouTube URL formats
function extractVideoId(url: string): string | null {
  // Handle regular YouTube URLs with v parameter
  const vMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (vMatch) {
    return vMatch[1];
  }
  
  // Handle youtu.be URLs
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) {
    return shortMatch[1];
  }
  
  // Handle embed URLs
  const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) {
    return embedMatch[1];
  }
  
  return null;
}

// Helper function to validate YouTube URL (including playlist URLs)
function isValidYouTubeUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace('www.', '').replace('m.', '');
    
    if (!['youtube.com', 'youtu.be'].includes(hostname)) {
      return false;
    }
    
    // For youtube.com, check if it has a video ID
    if (hostname === 'youtube.com') {
      return urlObj.searchParams.has('v') && urlObj.searchParams.get('v')?.length === 11;
    }
    
    // For youtu.be, the video ID should be in the pathname
    if (hostname === 'youtu.be') {
      const pathParts = urlObj.pathname.split('/');
      return pathParts.length >= 2 && pathParts[1].length === 11;
    }
    
    return false;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest){
    try{
        const data = CreateStreamSchema.parse(await req.json());
        
        // Validate YouTube URL
        if (!isValidYouTubeUrl(data.url)) {
          return NextResponse.json({
            message: "Only YouTube links are supported at the moment, please enter a valid YouTube link"
          },{
            status: 411
          });
        }

        // Extract video ID using the helper function
        const extractedId = extractVideoId(data.url);
        
        if (!extractedId) {
          return NextResponse.json({
            message: "Could not extract video ID from the provided YouTube URL"
          },{
            status: 411
          });
        }

        console.log("Extracted ID:", extractedId);
        
        const res = await youtubesearchapi.GetVideoDetails(extractedId);
        console.log(res);
        console.log("length; " + res.length);
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