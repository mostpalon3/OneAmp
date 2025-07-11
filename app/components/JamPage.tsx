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
      
      // Consider user inactive after 30 seconds of no activity
      activityTimer = setTimeout(() => {
        setIsUserActive(false);
      }, 30000);
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

  // Adjust polling based on user activity
  useEffect(() => {
    if (isUserActive) {
      setPollingInterval(1500); // Fast polling for active users
      console.log("User is active, polling at 1500ms interval");
    } else {
      console.log("User is inactive, slowing down polling");
      setPollingInterval(10000); // Slower polling for inactive users
    }
  }, [isUserActive]);


  const fetchInitialStreams = useCallback(async () => {
    const streams = await refreshStreams(jamId);
    if (streams) {
      const transformedStreams = streams.streams.map((stream: any) => ({
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
      }));
      
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

  // Subscribe to real-time vote updates with more aggressive refresh
  useEffect(() => {
    const eventSource = new EventSource(`/api/streams/subscribe/${jamId}`);
    
    eventSource.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            console.log('📡 Real-time update received:', data);
            
            if (data.type === 'vote_update' || data.type === 'vote_changed') {
                console.log('🔄 Refreshing streams due to vote update');
                // Immediate refresh when vote changes
                fetchInitialStreams();
            }
        } catch (error) {
            console.error('Error parsing real-time update:', error);
        }
    };

    eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
    };

    return () => {
        console.log('🔌 Closing EventSource connection');
        eventSource.close();
    };
  }, [jamId, fetchInitialStreams]);

  const handleVote = async (songId: number | string, isUpvote: boolean) => {
    if (!songId) {
      console.error('handleVote called with undefined songId');
      return;
    }

    console.log(`🗳️ Voting ${isUpvote ? 'UP' : 'DOWN'} on song ${songId}`);

    try {
      // Make the vote API call
      await voteOnStream(String(songId), isUpvote);
      
      console.log('✅ Vote submitted successfully');
      // Optimistic update for immediate feedback
      setQueue((prevQueue) =>
        prevQueue.map((song) => {
          if (song.id === songId) {
            let newVotes = song.votes;
            let newUserVoted = song.userVoted;

            if (song.userVoted === (isUpvote ? "up" : "down")) {
              newVotes = isUpvote ? newVotes - 1 : newVotes + 1;
              newUserVoted = null;
            } else if (song.userVoted === null) {
              newVotes = isUpvote ? newVotes + 1 : newVotes - 1;
              newUserVoted = isUpvote ? "up" : "down";
            } else {
              newVotes = isUpvote ? newVotes + 2 : newVotes - 2;
              newUserVoted = isUpvote ? "up" : "down";
            }

            return { ...song, votes: newVotes, userVoted: newUserVoted };
          }
          return song;
        })
      );
      
      // Force refresh after successful vote to ensure consistency
      setTimeout(() => {
        fetchInitialStreams();
      }, 1000);
      
    } catch (error) {
      console.error('❌ Error voting:', error);
      // Revert optimistic update on error
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