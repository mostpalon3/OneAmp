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
import { AddMusicForm } from "./jam/AddMusicForm"
import { QRCodeShare } from "./jam/HandleShare"
import { Toaster } from "react-hot-toast"
import { JamLikes } from "./jam/JamLikes"
import { useJamSocket } from "@/app/lib/hooks/useSocket"

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

  // 🔌 SOCKET.IO: Use jam socket for real-time updates
  const { socket, isConnected, viewerCount } = useJamSocket(jamId)

  // Fallback polling interval — much slower now that sockets handle real-time
  const FALLBACK_POLL_INTERVAL = 10000 // 10 seconds fallback

  const fetchInitialStreams = useCallback(async () => {    
    const streams = await refreshStreams(jamId);
    if (streams) {      
      console.log("🔍 API response - activeStream:", streams.activeStream);
      console.log("🔍 API response - streams count:", streams.streams?.length);
      
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
        return transformed;
      });
      
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

      console.log("🔍 currentTransformedStream videoId:", currentTransformedStream.videoId);
      
      setQueue(sortedStreams);
      setCurrentVideo(currentTransformedStream);
    }
  }, [jamId]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Track songs with pending votes to prevent socket overwrites
  const pendingVotes = useRef<Set<string>>(new Set());

  // Initial fetch + fallback polling only when socket is NOT connected
  useEffect(() => {
    fetchInitialStreams();
    if (!isConnected) {
      const interval = setInterval(() => {
        fetchInitialStreams();
      }, FALLBACK_POLL_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [jamId, isConnected]);

  // 🔌 SOCKET.IO: Listen for real-time vote updates
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleVoteUpdate = (data: {
      streamId: string;
      votes: number;
      type: string;
      userId: string;
    }) => {
      // Skip if this user has a pending vote on this song (optimistic already applied)
      if (pendingVotes.current.has(data.streamId)) {
        return;
      }

      // Update queue item vote count and re-sort
      setQueue(prev =>
        prev.map(song =>
          String(song.id) === data.streamId
            ? { ...song, votes: data.votes }
            : song
        ).sort((a, b) => b.votes !== a.votes ? b.votes - a.votes : String(a.id).localeCompare(String(b.id)))
      );

      // Update current video if it's the one being voted on
      setCurrentVideo(prev =>
        String(prev.id) === data.streamId
          ? { ...prev, votes: data.votes }
          : prev
      );
    };

    socket.on("vote-update", handleVoteUpdate);
    return () => { socket.off("vote-update", handleVoteUpdate); };
  }, [socket, isConnected]);

  // 🔌 SOCKET.IO: Listen for new streams added by other users
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleStreamAdded = (data: { stream: any; jamId: string }) => {
      console.log(`🔌 New stream added: "${data.stream.title}"`);

      const newSong: Song = {
        id: data.stream.id,
        title: data.stream.title || "Unknown Title",
        artist: data.stream.artist || "Unknown Artist",
        duration: data.stream.duration || "0:00",
        platform: "youtube",
        videoId: data.stream.extractedId,
        thumbnail: data.stream.smallImg,
        votes: data.stream.votes || 0,
        userVoted: null,
        submittedBy: data.stream.submittedBy || "anonymous",
      };

      setQueue(prev => {
        // Don't add if already exists
        if (prev.some(s => String(s.id) === String(newSong.id))) return prev;
        const updated = [...prev, newSong];
        return updated.sort((a, b) =>
          b.votes !== a.votes ? b.votes - a.votes : String(a.id).localeCompare(String(b.id))
        );
      });
    };

    socket.on("stream-added", handleStreamAdded);
    return () => { socket.off("stream-added", handleStreamAdded); };
  }, [socket, isConnected]);

  // 🔌 SOCKET.IO: Listen for now-playing changes (Play Next)
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNowPlayingChanged = (data: {
      newActiveStream: any;
      removedStreamId: string | null;
      queueEmpty: boolean;
    }) => {
      console.log(`🔌 Now playing changed:`, data.newActiveStream?.title || "Queue empty");

      if (data.queueEmpty || !data.newActiveStream) {
        setCurrentVideo({
          id: 0,
          title: "No active stream",
          artist: "Add songs to the queue",
          duration: "0:00",
          currentTime: "0:00",
          platform: "youtube",
          videoId: "",
          thumbnail: "/images/not.png",
          votes: 0,
        });
      } else {
        setCurrentVideo({
          id: data.newActiveStream.id,
          title: data.newActiveStream.title || "Unknown Title",
          artist: data.newActiveStream.artist || "Unknown Artist",
          duration: data.newActiveStream.duration || "0:00",
          currentTime: "0:00",
          platform: data.newActiveStream.type?.toLowerCase() || "youtube",
          videoId: data.newActiveStream.extractedId,
          thumbnail: data.newActiveStream.smallImg,
          votes: data.newActiveStream.votes || 0,
          submittedBy: data.newActiveStream.submittedBy || "anonymous",
        });
      }

      // Remove the played stream from the queue
      if (data.removedStreamId) {
        setQueue(prev => prev.filter(song => String(song.id) !== String(data.removedStreamId)));
      }
    };

    socket.on("now-playing-changed", handleNowPlayingChanged);
    return () => { socket.off("now-playing-changed", handleNowPlayingChanged); };
  }, [socket, isConnected]);

  // Optimistic voting — update UI instantly, then sync with server
  const handleVote = async (songId: number | string, isUpvote: boolean) => {
    if (!songId) {
      console.error('handleVote called with undefined songId');
      return;
    }

    const sid = String(songId);

    // Mark as pending so socket events don't overwrite our optimistic state
    pendingVotes.current.add(sid);

    // 🚀 Optimistic update — change UI immediately
    setQueue(prev => prev.map(song => {
      if (String(song.id) !== sid) return song;
      
      const wasUpvoted = song.userVoted === 'up';
      const wasDownvoted = song.userVoted === 'down';
      
      let voteDelta = 0;
      let newUserVoted: 'up' | 'down' | null = null;

      if (isUpvote) {
        if (wasUpvoted) {
          voteDelta = -1;
          newUserVoted = null;
        } else if (wasDownvoted) {
          voteDelta = 2;
          newUserVoted = 'up';
        } else {
          voteDelta = 1;
          newUserVoted = 'up';
        }
      } else {
        if (wasDownvoted) {
          voteDelta = 1;
          newUserVoted = null;
        } else if (wasUpvoted) {
          voteDelta = -2;
          newUserVoted = 'down';
        } else {
          voteDelta = -1;
          newUserVoted = 'down';
        }
      }

      return { ...song, votes: song.votes + voteDelta, userVoted: newUserVoted };
    }).sort((a, b) => b.votes !== a.votes ? b.votes - a.votes : String(a.id).localeCompare(String(b.id))));

    try {
      await voteOnStream(sid, isUpvote);
    } catch (error) {
      console.error('❌ Error voting:', error);
      fetchInitialStreams();
    } finally {
      // Clear pending after a short delay to let any in-flight socket events pass
      setTimeout(() => {
        pendingVotes.current.delete(sid);
      }, 2000);
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
      
      // Socket event will handle UI updates for all users
      // Small delay then refresh for this user's state consistency
      setTimeout(() => {
        fetchInitialStreams();
      }, 300);
      
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
    setTimeout(() => {
      handlePlayNext();
    }, 1000);
  }, [handlePlayNext]);

  const syncCounterRef = useRef(0);
  
  const handleTimeUpdate = useCallback((currentTime: number) => {
    setCurrentPlayTime(currentTime);
    setCurrentVideo(prev => ({
      ...prev,
      currentTime: formatTime(currentTime)
    }));

    // 🎵 PLAYBACK SYNC: Creator broadcasts position every 5 seconds
    if (playVideo && socket && isConnected && currentVideo.videoId) {
      syncCounterRef.current++;
      if (syncCounterRef.current % 5 === 0) {
        socket.emit("playback-sync", {
          jamId,
          streamId: String(currentVideo.id),
          currentTime,
        });
      }
    }
  }, [playVideo, socket, isConnected, currentVideo.videoId, currentVideo.id, jamId]);

  // 🎵 PLAYBACK SYNC: Joiner receives initial position on join
  const [initialSeekTime, setInitialSeekTime] = useState<number | null>(null);
  
  useEffect(() => {
    if (!socket || !isConnected || playVideo) return; // Only joiners listen

    const handlePlaybackPosition = (data: { streamId: string; currentTime: number }) => {
      console.log(`🎵 Playback sync received: seek to ${Math.floor(data.currentTime)}s`);
      setInitialSeekTime(data.currentTime);
    };

    socket.on("playback-position", handlePlaybackPosition);
    return () => { socket.off("playback-position", handlePlaybackPosition); };
  }, [socket, isConnected, playVideo]);

  const streamStats: JamStatsType = {
    totalVotes: queue.reduce((sum, song) => sum + Math.abs(song.votes), 0),
    songsInQueue: queue.length,
    youtubeVideos: queue.filter((song) => song.platform === "youtube").length,
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <AppBar jamId={jamId} viewerCount={viewerCount} isSocketConnected={isConnected} />

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
                  isCreator={playVideo}
                  startAt={initialSeekTime}
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