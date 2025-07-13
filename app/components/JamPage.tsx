"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { AppBar } from "./AppBar"
import { JamHeader } from "./jam/JamHeader"
import { NowPlaying } from "./jam/NowPlaying"
import { QueueList } from "./jam/QueueList"
import { PlayNextButton } from "./jam/PlayNextButton"
import { JamStats } from "./jam/JamStats"
import { Song, CurrentVideo, JamStats as JamStatsType } from "@/app/lib/types/jam-types"
import { refreshStreams, voteOnStream } from "@/app/lib/utils/api-utils"
// import { POLLING_INTERVAL } from "@/app/lib/constants/stream-constants"
import { AddMusicForm } from "./jam/AddMusicForm"
import { QRCodeShare } from "./jam/HandleShare"
import { Toaster } from "react-hot-toast"
import { JamLikes } from "./jam/JamLikes"

export default function JamPage({
  jamId,
  playVideo = false
}: {
  jamId: string,
  playVideo: boolean
}) {
  const [queue, setQueue] = useState<Song[]>([])
  const [currentVideo, setCurrentVideo] = useState<CurrentVideo>({
    id: 0,
    title: "No tracks available",
    artist: "Add a song to get started",
    duration: "0:00",
    currentTime: "0:00",
    platform: "youtube",
    videoId: "",
    thumbnail: "/placeholder.svg",
    votes: 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [currentPlayTime, setCurrentPlayTime] = useState(0)
  const [isUserActive, setIsUserActive] = useState(true);
  const [pollingInterval, setPollingInterval] = useState(2000);

  // Track user activity
  useEffect(() => {
    let activityTimer: NodeJS.Timeout;

    const resetActivityTimer = () => {
      setIsUserActive(true);
      clearTimeout(activityTimer);
      
      // Consider user inactive after 15 seconds (reduced from 30)
      activityTimer = setTimeout(() => {
        setIsUserActive(false);
      }, 15000);
    };

    // Listen for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, resetActivityTimer, true);
    });

    resetActivityTimer(); // Initial call

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetActivityTimer, true);
      });
      clearTimeout(activityTimer);
    };
  }, []);

  // Adjust polling based on user activity - faster polling for better vote sync
  useEffect(() => {
    if (isUserActive) {
      setPollingInterval(500); // Very aggressive polling for active users (reduced from 1000)
      console.log("User is active, polling at 500ms interval");
    } else {
      console.log("User is inactive, slowing down polling");
      setPollingInterval(2000); // Faster polling even for inactive users (reduced from 5000)
    }
  }, [isUserActive]);


  const fetchInitialStreams = useCallback(async () => {    
    const streams = await refreshStreams(jamId);
    if (streams) {      
      const transformedStreams = streams.streams.map((stream: any) => {
        const transformed = {
          id: stream.id,
          title: stream.title || "Unknown Title",
          artist: stream.artist || "Unknown Artist", 
          duration: stream.duration || "0:00",
          platform: stream.type.toLowerCase(),
          videoId: stream.extractedId,
          thumbnail: stream.smallImg,
          votes: stream.votes || ((stream._count?.upvotes || 0) - (stream._count?.downvotes || 0)),
          userVoted: stream.userVoted || null,
          submittedBy: stream.submittedBy,
        };
        
        console.log(`🎵 Stream ${stream.id}: votes=${transformed.votes}, userVoted=${transformed.userVoted}, title="${transformed.title}"`);
        return transformed;
      });
      
      console.log(`🎵 All transformed streams for user ${streams.userId}:`, transformedStreams.map((s: { id: any; title: any; votes: any; userVoted: any }) => ({
        id: s.id,
        title: s.title,
        votes: s.votes,
        userVoted: s.userVoted
      })));
      
      const sortedStreams = transformedStreams.sort((a: any, b: any) => {
        if (b.votes !== a.votes) {
          return b.votes - a.votes;
        }
        return a.id.localeCompare(b.id);
      });

      const currentTransformedStream = streams.activeStream ? {
          id: streams.activeStream.id,
          title: streams.activeStream.title || "Unknown Title",
          artist: streams.activeStream.artist || "Unknown Artist",
          duration: streams.activeStream.duration || "0:00",
          currentTime: formatTime(currentPlayTime),
          platform: streams.activeStream.type?.toLowerCase() || 'youtube',
          videoId: streams.activeStream.extractedId,
          thumbnail: streams.activeStream.smallImg,
          votes: streams.activeStream.votes,
          submittedBy: streams.activeStream.submittedBy || streams.activeStream.userId || "anonymous"
      } : {
        id: 0,
        title: "No active stream",
        artist: "Add songs to the queue",
        duration: "0:00",
        currentTime: "0:00",
        platform: "youtube",
        videoId: "",
        thumbnail: "/images/not.png",
        votes: 0,
      };

      setQueue(sortedStreams);
      setCurrentVideo(currentTransformedStream);
    }
  }, [jamId, pollingInterval]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    fetchInitialStreams();
    const interval = setInterval(() => {
      fetchInitialStreams();
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [jamId]);

  const handleVote = async (songId: number | string, isUpvote: boolean) => {
    if (!songId) {
      console.error('handleVote called with undefined songId');
      return;
    }
    

    try {
      // Make the API call first
      const voteResponse = await voteOnStream(String(songId), isUpvote);
      console.log(`✅ Vote API response:`, voteResponse);
      
      // Immediately refresh streams multiple times to ensure we get the latest state
      const refreshPromise = async () => {
        for (let i = 0; i < 3; i++) {
          await new Promise(resolve => setTimeout(resolve, 100 * (i + 1))); // 100ms, 200ms, 300ms delays
          console.log(`🔄 Refresh attempt ${i + 1}/3 after vote`);
          await fetchInitialStreams();
        }
      };
      
      refreshPromise();
      
    } catch (error) {
      console.error('❌ Error voting:', error);
      // If vote fails, also refresh to ensure UI matches server state
      fetchInitialStreams();
    }
  };

  const handlePlayNext = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/streams/nextstream/${jamId}`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to play next song');
      }
      setCurrentPlayTime(0); // Reset timer for new song
      
      // Wait a moment before refreshing to ensure database is updated
      setTimeout(() => {
        fetchInitialStreams();
      }, 500);
      
    } catch (error) {
      console.error('Error playing next song:', error);
      if (error instanceof Error) {
        console.error('Detailed error:', error.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleVideoEnd = useCallback(() => {
    // Add a small delay to prevent rapid successive calls
    setTimeout(() => {
      handlePlayNext();
    }, 1000);
  }, [handlePlayNext]);

  const handleTimeUpdate = useCallback((currentTime: number) => {
    setCurrentPlayTime(currentTime);
    // Update the current video's currentTime for display
    setCurrentVideo(prev => ({
      ...prev,
      currentTime: formatTime(currentTime)
    }));
  }, []);

  const streamStats: JamStatsType = {
    totalVotes: queue.reduce((sum, song) => sum + Math.abs(song.votes), 0),
    songsInQueue: queue.length,
    youtubeVideos: queue.filter((song) => song.platform === "youtube").length,
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <AppBar jamId={jamId} />

      <div className="flex-1 md:overflow-hidden">
        <div className="container mx-auto px-4 lg:px-6 py-6 h-full">
          <JamHeader />
          
          <div className="grid lg:grid-cols-3 gap-6 h-[calc(100%-90px)]">
            {/* Main Content Section - 2/3 width with hidden scrollbar */}
            <div className="lg:col-span-2 md:overflow-y-auto scrollbar-hide">
              <div className="space-y-6">
                <NowPlaying 
                  currentVideo={currentVideo}
                  onVideoEnd={handleVideoEnd}
                  onTimeUpdate={handleTimeUpdate}
                />
                <div className="order-1 lg:hidden">
                  <AddMusicForm 
                    jamId={jamId}
                    onSongAdded={fetchInitialStreams}
                  />
                </div>
                <QueueList queue={queue} onVote={handleVote} />
              </div>
            </div>

            {/* Sidebar - 1/3 width with visible scrollbar */}
            <div className="md:overflow-y-auto scrollbar-hide">
              <div className="space-y-6">
                <div className="hidden lg:block">
                  <AddMusicForm 
                    jamId={jamId}
                    onSongAdded={fetchInitialStreams}
                  />
                </div>
                
                {playVideo && (
                  <PlayNextButton 
                    onPlayNext={handlePlayNext}
                    isLoading={isLoading}
                    queueEmpty={queue.length === 0}
                  />
                )}

                <JamStats stats={streamStats} />
                <JamLikes jamId={jamId} />
                
                {/* Replace QuickActions with QRCodeShare */}
                <div className="bg-white rounded-lg p-4 shadow-sm border">
                  <h3 className="font-medium text-gray-900 mb-3">Share Stream</h3>
                  <QRCodeShare jamId={jamId} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Toaster/>
    </div>
  )
}