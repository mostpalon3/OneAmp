// /api/streams/preview/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { StreamCacheService } from '@/app/lib/redis/stream-cache';

const PreviewSchema = z.object({
  url: z.string()
});

// Helper function to extract video ID from various YouTube URL formats
function extractVideoId(url: string): string | null {
  const vMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (vMatch) {
    return vMatch[1];
  }
  
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) {
    return shortMatch[1];
  }
  
  const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) {
    return embedMatch[1];
  }
  
  return null;
}

function isValidYouTubeUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace('www.', '').replace('m.', '');
    
    if (!['youtube.com', 'youtu.be'].includes(hostname)) {
      return false;
    }
    
    if (hostname === 'youtube.com') {
      return urlObj.searchParams.has('v') && urlObj.searchParams.get('v')?.length === 11;
    }
    
    if (hostname === 'youtu.be') {
      const pathParts = urlObj.pathname.split('/');
      return pathParts.length >= 2 && pathParts[1].length === 11;
    }
    
    return false;
  } catch {
    return false;
  }
}

function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  
  if (!match) {
    return 0;
  }
  
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  
  return hours * 3600 + minutes * 60 + seconds;
}

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
  try {
    const data = PreviewSchema.parse(await req.json());
    
    if (!isValidYouTubeUrl(data.url)) {
      return NextResponse.json({
        message: "Only YouTube links are supported at the moment, please enter a valid YouTube link"
      }, {
        status: 411
      });
    }

    const extractedId = extractVideoId(data.url);
    
    if (!extractedId) {
      return NextResponse.json({
        message: "Could not extract video ID from the provided YouTube URL"
      }, {
        status: 411
      });
    }

    // 🔥 REDIS INTEGRATION: Try to get cached preview first
    const cachedPreview = await StreamCacheService.getCachedVideoPreview(extractedId);
    
    if (cachedPreview) {
      console.log(`✅ Cache HIT for video preview: ${extractedId}`);
      return NextResponse.json({
        ...cachedPreview,
        source: 'cache' // For debugging
      });
    }

    console.log(`❌ Cache MISS for video preview: ${extractedId}, fetching from YouTube API`);

    // If not cached, fetch from YouTube API
    const res = await getVideoDetails(extractedId);
    const thumbnails = res.thumbnail.thumbnails;
    
    // Sort thumbnails by width
    thumbnails.sort((a: {width: number}, b: {width: number}) => a.width < b.width ? -1 : 1);

    const previewData = {
      title: res.title,
      artist: res.channelTitle,
      duration: parseDuration(res.duration),
      smallImg: (thumbnails.length > 1 ? thumbnails[thumbnails.length - 2].url : thumbnails[thumbnails.length - 1].url) ?? "https://i.pinimg.com/736x/22/f4/28/22f4285d816b01de00ebfd1dcc99fa72.jpg",
      bigImg: thumbnails[thumbnails.length - 1].url ?? "https://i.pinimg.com/736x/22/f4/28/22f4285d816b01de00ebfd1dcc99fa72.jpg",
      extractedId,
      channelTitle: res.channelTitle,
      publishedAt: res.publishedAt,
      viewCount: res.viewCount,
      source: 'api' // For debugging
    };

    // 🔥 REDIS INTEGRATION: Cache the preview data
    await StreamCacheService.cacheVideoPreview(extractedId, previewData);

    console.log(`✅ Successfully cached preview for: ${res.title}`);

    return NextResponse.json(previewData);
  } catch (error) {
    console.error('Preview API error:', error);
    
    // More specific error messages
    if (error instanceof Error) {
      if (error.message.includes('YouTube API key not configured')) {
        return NextResponse.json({
          message: "YouTube API configuration error"
        }, { status: 500 });
      }
      
      if (error.message.includes('YouTube API request failed')) {
        return NextResponse.json({
          message: "Failed to fetch video details from YouTube"
        }, { status: 502 });
      }
      
      if (error.message.includes('Video not found')) {
        return NextResponse.json({
          message: "Video not found or is private/unavailable"
        }, { status: 404 });
      }
    }
    
    return NextResponse.json({
      message: "Error while fetching video preview",
      error: error instanceof Error ? error.message : "Unknown error occurred"
    }, {
      status: 500
    });
  }
}