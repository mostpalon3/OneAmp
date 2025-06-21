"use client"

import { useState, useEffect, useCallback } from "react"
import { AppBar } from "./AppBar"
import { StreamHeader } from "./stream/StreamHeader"
import { NowPlaying } from "./stream/NowPlaying"
import { QueueList } from "./stream/QueueList"
import { PlayNextButton } from "./stream/PlayNextButton"
import { StreamStats } from "./stream/StreamStats"
import { QuickActions } from "./stream/QuickActions"
import { Song, CurrentVideo, StreamStats as StreamStatsType } from "@/app/lib/types/stream-types"
import { refreshStreams, voteOnStream } from "@/app/lib/utils/api-utils"
import { REFRESH_INTERVAL_MS } from "@/app/lib/constants/stream-constants"
import { AddMusicForm } from "./stream/AddMusicForm"
import { QRCodeShare } from "./stream/HandleShare"
import { Toaster } from "react-hot-toast"

export default function StreamView({
  creatorId,
  playVideo = false
}: {
  creatorId: string,
  playVideo: boolean
}) {
  const [queue, setQueue] = useState<Song[]>([])
  const [currentPlaying, setCurrentPlaying] = useState<"spotify" | "youtube">("youtube")
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

  const fetchInitialStreams = async () => {
    const streams = await refreshStreams(creatorId);
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
        thumbnail: "/placeholder.svg",
        votes: 0,
      };
      
      setQueue(sortedStreams);
      setCurrentPlaying(streams.activeStream?.type?.toLowerCase() || "youtube");
      setCurrentVideo(currentTransformedStream);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    fetchInitialStreams();
    const interval = setInterval(() => {
      fetchInitialStreams();
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [creatorId]);

  const handleVote = async (songId: number | string, isUpvote: boolean) => {
    if (!songId) {
      console.error('handleVote called with undefined songId');
      return;
    }

    try {
      await voteOnStream(String(songId), isUpvote);

      setQueue((prevQueue) =>
        prevQueue
          .map((song) => {
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
          .sort((a, b) => {
            if (b.votes !== a.votes) {
              return b.votes - a.votes;
            }
            return String(a.id).localeCompare(String(b.id));
          })
      );
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handlePlayNext = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/streams/nextstream`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to play next song');
      }
      // setWasEmpty(response.queueEmpty);
      
      const data = await response.json();
      console.log('Next song played:', data);
      setCurrentPlayTime(0); // Reset timer for new song
      
      // Wait a moment before refreshing to ensure database is updated
      setTimeout(() => {
        fetchInitialStreams();
      }, 1000);
      
    } catch (error) {
      console.error('Error playing next song:', error);
      // You might want to show a toast notification here
      if (error instanceof Error) {
        console.error('Detailed error:', error.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleVideoEnd = useCallback(() => {
    console.log('Video/Track ended, playing next...');
    // Add a small delay to prevent rapid successive calls
    setTimeout(() => {
      handlePlayNext();
    }, 1500);
  }, [handlePlayNext]);

  const handleTimeUpdate = useCallback((currentTime: number) => {
    setCurrentPlayTime(currentTime);
    // Update the current video's currentTime for display
    setCurrentVideo(prev => ({
      ...prev,
      currentTime: formatTime(currentTime)
    }));
  }, []);

  const streamStats: StreamStatsType = {
    totalVotes: queue.reduce((sum, song) => sum + Math.abs(song.votes), 0),
    songsInQueue: queue.length,
    youtubeVideos: queue.filter((song) => song.platform === "youtube").length,
    spotifyTracks: queue.filter((song) => song.platform === "spotify").length,
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {AppBar(String(creatorId))}

      <div className="flex-1 overflow-hidden">
        <div className="container mx-auto px-4 lg:px-6 py-6 h-full">
          <StreamHeader />

          <div className="grid lg:grid-cols-3 gap-6 h-[calc(100%-100px)]">
            {/* Main Content Section - 2/3 width with hidden scrollbar */}
            <div className="lg:col-span-2 overflow-y-auto scrollbar-hide">
              <div className="space-y-6">
                <NowPlaying 
                  currentPlaying={currentPlaying}
                  setCurrentPlaying={setCurrentPlaying}
                  currentVideo={currentVideo}
                  onVideoEnd={handleVideoEnd}
                  onTimeUpdate={handleTimeUpdate}
                />
                <QueueList queue={queue} onVote={handleVote} />
              </div>
            </div>

            {/* Sidebar - 1/3 width with visible scrollbar */}
            <div className="overflow-y-auto scrollbar-hide">
              <div className="space-y-6 ">
                <AddMusicForm 
                  creatorId={creatorId}
                  onSongAdded={fetchInitialStreams}
                />
                
                {playVideo && (
                  <PlayNextButton 
                    onPlayNext={handlePlayNext}
                    isLoading={isLoading}
                    queueEmpty={queue.length === 0}
                  />
                )}

                <StreamStats stats={streamStats} />
                
                {/* Replace QuickActions with QRCodeShare */}
                <div className="bg-white rounded-lg p-4 shadow-sm border">
                  <h3 className="font-medium text-gray-900 mb-3">Share Stream</h3>
                  <QRCodeShare creatorId={creatorId} />
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