import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
// import { getServerSession } from "next-auth";
// import { GET as handler } from "@/app/api/auth/[...nextauth]/route";

const CreateStreamSchema = z.object({
  creatorId: z.string(),
  url: z.string()
});

// Helper function to parse YouTube duration format (PT4M13S) to seconds
function parseDuration(duration: string): number {
  // YouTube API returns duration in ISO 8601 format (e.g., "PT4M13S")
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

  if (!match) {
    return 0;
  }

  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);

  return hours * 3600 + minutes * 60 + seconds;
}

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

// Function to get video details using YouTube Data API v3
async function getVideoDetails(videoId: string) {
  const API_KEY = process.env.YOUTUBE_API_KEY;

  if (!API_KEY) {
    throw new Error('YouTube API key is not configured');
  }

  const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${API_KEY}&part=snippet,contentDetails,statistics`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`YouTube API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      throw new Error('Video not found or is private/unavailable');
    }

    const video = data.items[0];
    const snippet = video.snippet;
    const thumbnails = snippet.thumbnails;

    // Convert thumbnails to array format similar to youtube-search-api
    const thumbnailArray = Object.entries(thumbnails).map(([key, thumbnail]: [string, any]) => ({
      url: thumbnail.url,
      width: thumbnail.width,
      height: thumbnail.height,
      quality: key
    }));

    return {
      title: snippet.title,
      description: snippet.description,
      channelTitle: snippet.channelTitle,
      publishedAt: snippet.publishedAt,
      duration: video.contentDetails.duration,
      viewCount: video.statistics.viewCount,
      thumbnail: {
        thumbnails: thumbnailArray
      }
    };
  } catch (error) {
    console.error('Error fetching video details:', error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  try {
    const data = CreateStreamSchema.parse(await req.json());

    // Validate YouTube URL
    if (!isValidYouTubeUrl(data.url)) {
      return NextResponse.json({
        message: "Only YouTube links are supported at the moment, please enter a valid YouTube link"
      }, {
        status: 411
      });
    }

    // Extract video ID using the helper function
    const extractedId = extractVideoId(data.url);

    if (!extractedId) {
      return NextResponse.json({
        message: "Could not extract video ID from the provided YouTube URL"
      }, {
        status: 411
      });
    }

    // Use YouTube Data API v3 instead of youtube-search-api
    const res = await getVideoDetails(extractedId);

    const thumbnails = res.thumbnail.thumbnails;
    thumbnails.sort((a: { width: number }, b: { width: number }) => a.width < b.width ? -1 : 1);

    const stream = await prismaClient.stream.create({
      data: {
        title: res.title,
        userId: data.creatorId,
        url: data.url,
        extractedId,
        type: "YouTube",
        smallImg: (thumbnails.length > 1 ? thumbnails[thumbnails.length - 2].url : thumbnails[thumbnails.length - 1].url) ?? "https://i.pinimg.com/736x/22/f4/28/22f4285d816b01de00ebfd1dcc99fa72.jpg",
        bigImg: thumbnails[thumbnails.length - 1].url ?? "https://i.pinimg.com/736x/22/f4/28/22f4285d816b01de00ebfd1d1cc99fa72.jpg",
        duration: parseDuration(res.duration),
        artist: res.channelTitle,
        played: false,
        submittedBy: session?.user?.name ?? "anonymous",
      }
    });
    return NextResponse.json({
      message: "Stream added successfully",
      ...stream,
    }, {
      status: 201
    });
  } catch (error) {
    return NextResponse.json({
      message: "Error while adding a stream",
      error: error instanceof Error ? error.message : "Unknown error occurred"
    }, {
      status: 411
    })
  }
}

export async function GET(req: NextRequest) {
  const creatorId = req.nextUrl.searchParams.get('creatorId');
  const session = await getServerSession();
  //TODO:u can get rid of db call here
  const user = await prismaClient.user.findFirst({
    where: {
      email: session?.user?.email ?? ""
    }
  });
  if (!creatorId) {
    return NextResponse.json({
      message: "Creator ID is required"
    }, {
      status: 411
    });
  }
  if (!user) {
    return NextResponse.json({
      message: "Unauthenticated"
    }, {
      status: 403
    });
  }
const [streams,activeStream] = await Promise.all([prismaClient.stream.findMany({
  where: {
    userId: creatorId,
    played: false
  },
  include: {
    _count: {
      select: {
        upvotes: true,
        downvotes: true,
      }
    },
    upvotes: {
      where: {
        userId: user.id
      }
    },
    downvotes: {
      where: {
        userId: user.id
      }
    }
  }
}), prismaClient.currentStream.findFirst({
  where: {
    userId: creatorId
  },
  include:{
    stream: {
      include: {
        _count: {
          select: {
            upvotes: true,
            downvotes: true,
          }
        },
        upvotes: {
          where: {
            userId: user.id
          }
        },
        downvotes: {
          where: {
            userId: user.id
          }
        }
      }
    }
  }
})])

  const streamsWithVotes = streams.map((stream: any) => ({
    ...stream,
    votes: stream._count.upvotes - stream._count.downvotes,
    userVoted: stream.upvotes.length > 0 ? "up" :
      stream.downvotes.length > 0 ? "down" : null
  }));
  const activeStreamWithVotes = activeStream?.stream ? {
    ...activeStream.stream,
    votes: activeStream.stream._count.upvotes - activeStream.stream._count.downvotes,
  } : null;

  return NextResponse.json({
    streams: streamsWithVotes,
    activeStream: activeStreamWithVotes
  });
}