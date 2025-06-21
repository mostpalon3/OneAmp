"use client"

import { useState, useEffect } from "react"
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
        submittedBy: stream.submittedBy || stream.userId || "anonymous"
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
          currentTime: "0:00",
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

  const handlePlayNext = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/streams/nextstream`);
      if (!response.ok) {
        throw new Error('Failed to play next song');
      }
      const data = await response.json();
      console.log('Next song played:', data);
      await fetchInitialStreams();
    } catch (error) {
      console.error('Error playing next song:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const streamStats: StreamStatsType = {
    totalVotes: queue.reduce((sum, song) => sum + Math.abs(song.votes), 0),
    songsInQueue: queue.length,
    youtubeVideos: queue.filter((song) => song.platform === "youtube").length,
    spotifyTracks: queue.filter((song) => song.platform === "spotify").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {AppBar(String(creatorId))}

      <div className="container mx-auto px-4 lg:px-6 py-6">
        <StreamHeader />

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <NowPlaying 
              currentPlaying={currentPlaying}
              setCurrentPlaying={setCurrentPlaying}
              currentVideo={currentVideo}
            />
            <QueueList queue={queue} onVote={handleVote} />
          </div>

          <div className="space-y-6">
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
            <QuickActions creatorId={creatorId} />
          </div>
        </div>
      </div>
    </div>
  )
}