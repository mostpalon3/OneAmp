import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthenticated" }, { status: 403 });
    }

    const query = req.nextUrl.searchParams.get("q");
    if (!query || query.trim().length < 2) {
      return NextResponse.json({ results: [] });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { message: "YouTube API key not configured" },
        { status: 500 }
      );
    }

    // Search for videos
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&q=${encodeURIComponent(query)}&key=${apiKey}`;
    const searchRes = await fetch(searchUrl);

    if (!searchRes.ok) {
      const errorData = await searchRes.json();
      console.error("YouTube search API error:", errorData);
      return NextResponse.json(
        { message: "YouTube search failed" },
        { status: 502 }
      );
    }

    const searchData = await searchRes.json();
    const videoIds = searchData.items
      ?.map((item: any) => item.id?.videoId)
      .filter(Boolean)
      .join(",");

    if (!videoIds) {
      return NextResponse.json({ results: [] });
    }

    // Get video details (duration, etc.)
    const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoIds}&key=${apiKey}`;
    const detailsRes = await fetch(detailsUrl);

    if (!detailsRes.ok) {
      return NextResponse.json(
        { message: "Failed to fetch video details" },
        { status: 502 }
      );
    }

    const detailsData = await detailsRes.json();

    const results = detailsData.items?.map((item: any) => {
      const duration = parseDuration(item.contentDetails?.duration || "PT0S");
      return {
        videoId: item.id,
        title: item.snippet?.title || "Unknown",
        artist: item.snippet?.channelTitle || "Unknown",
        thumbnail: item.snippet?.thumbnails?.medium?.url || "",
        duration,
        url: `https://www.youtube.com/watch?v=${item.id}`,
      };
    }) || [];

    return NextResponse.json({ results });
  } catch (error) {
    console.error("YouTube search error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Parse ISO 8601 duration (PT4M13S) to seconds
function parseDuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || "0");
  const minutes = parseInt(match[2] || "0");
  const seconds = parseInt(match[3] || "0");
  return hours * 3600 + minutes * 60 + seconds;
}
