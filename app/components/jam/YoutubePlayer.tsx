"use client"

import { FaYoutube, FaHeart, FaMusic, FaPlus } from "react-icons/fa"
import { HiOutlineMusicalNote } from "react-icons/hi2"
import { useEffect, useRef, useState } from "react"
import { MdOutlineDoNotDisturb } from "react-icons/md";

interface YouTubePlayerProps {
  currentVideo: {
    id: number
    title: string
    artist: string
    duration: string | number
    currentTime: string
    platform: string
    videoId: string
    thumbnail: string
    votes: number
  }
  isActive: boolean
  onToggle: () => void
  onVideoEnd?: () => void
  onTimeUpdate?: (currentTime: number) => void
  showControls?: boolean
  startAt?: number | null
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export function YouTubePlayer({ currentVideo, isActive, onToggle, onVideoEnd, onTimeUpdate, showControls = true, startAt = null }: YouTubePlayerProps) {
  const playerRef = useRef<any>(null);
  const [player, setPlayer] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [currentVideoId, setCurrentVideoId] = useState<string>("");
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  // Function to initialize YouTube player
  const initializePlayer = (videoId: string) => {
    if (playerRef.current && videoId && window.YT && window.YT.Player) {
      
      // Destroy existing player if it exists
      if (player) {
        try {
          player.destroy();
        } catch (e) {
          console.error('Error destroying player:', e);
        }
        setPlayer(null);
        setIsPlayerReady(false);
      }

      const newPlayer = new window.YT.Player(playerRef.current, {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          mute: 0,
          controls: showControls ? 1 : 0,
          modestbranding: 1,
          rel: 0,
          disablekb: showControls ? 0 : 1,
          start: startAt ? Math.floor(startAt) : 0,
        },
        events: {
          onReady: (event: any) => {
            setPlayer(event.target);
            setCurrentVideoId(videoId);
            setIsPlayerReady(true);
            // Ensure video starts playing
            setTimeout(() => {
              event.target.playVideo();
            }, 500);
          },
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              onVideoEnd?.();
            }
          },
          onError: (event: any) => {
            console.error('YouTube player error:', event.data);
          }
        },
      });
    }
  };

  // Main effect to handle YouTube API loading and player creation
  useEffect(() => {
    if (!isActive) {
      // Clean up when inactive
      if (player) {
        try {
          player.destroy();
        } catch (e) {
          console.error('Error destroying player during cleanup:', e);
        }
        setPlayer(null);
        setIsPlayerReady(false);
        setCurrentVideoId("");
      }
      return;
    }

    if (!currentVideo.videoId) {
      // No video to play, clean up
      if (player) {
        try {
          player.destroy();
        } catch (e) {
          console.error('Error destroying player - no video:', e);
        }
        setPlayer(null);
        setIsPlayerReady(false);
        setCurrentVideoId("");
      }
      return;
    }

    // Load YouTube IFrame API if not already loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }

      window.onYouTubeIframeAPIReady = () => {
        initializePlayer(currentVideo.videoId);
      };
    } else {
      // API already loaded, check if we need to create/update player
      if (!player || currentVideo.videoId !== currentVideoId) {
        initializePlayer(currentVideo.videoId);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, currentVideo.videoId, currentVideo.id]); // Added currentVideo.id to force refresh

  // Handle video changes for existing player
  useEffect(() => {
    if (player && isPlayerReady && isActive && currentVideo.videoId && currentVideo.videoId !== currentVideoId) {
      try {
        // More thorough validation of player object
        if (player && 
            typeof player === 'object' && 
            typeof player.loadVideoById === 'function' && 
            typeof player.getPlayerState === 'function') {
          
          // Additional check to ensure player is not destroyed
          let playerState;
          try {
            playerState = player.getPlayerState();
          } catch (stateError) {
            console.error('Error getting player state, reinitializing:', stateError);
            initializePlayer(currentVideo.videoId);
            return;
          }
          
          // Only proceed if player is in a valid state
          if (playerState !== undefined && playerState !== null && playerState !== -1) {
            try {
              player?.loadVideoById({
                videoId: currentVideo.videoId,
                startSeconds: 0
              });
              setCurrentVideoId(currentVideo.videoId);
              setCurrentTime(0);
            } catch (loadError) {
              console.error('Error loading video, reinitializing:', loadError);
              initializePlayer(currentVideo.videoId);
            }
          } else {
            // Player not ready, reinitialize
            initializePlayer(currentVideo.videoId);
          }
        } else {
          // Player methods not available, reinitialize
          initializePlayer(currentVideo.videoId);
        }
      } catch (error) {
        console.error('Error in video change effect:', error);
        // Clear the current player and reinitialize
        setPlayer(null);
        setIsPlayerReady(false);
        setCurrentVideoId("");
        setTimeout(() => {
          initializePlayer(currentVideo.videoId);
        }, 100);
      }
    }
  }, [player, isPlayerReady, isActive, currentVideo.videoId, currentVideoId]);

  // Timer for tracking playback
  useEffect(() => {
    if (player && isPlayerReady && isActive && currentVideo.videoId) {
      // Start timer interval
      intervalRef.current = setInterval(() => {
        try {
          if (player.getCurrentTime) {
            const time = player.getCurrentTime();
            setCurrentTime(time);
            onTimeUpdate?.(time);
          }
        } catch (error) {
          console.error('Error getting current time:', error);
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [player, isPlayerReady, isActive, currentVideo.videoId, onTimeUpdate]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDuration = (duration: string | number) => {
    const numDuration = Number(duration);
    if (isNaN(numDuration)) return typeof duration === 'string' ? duration : "00:00";
    const minutes = Math.floor(numDuration / 60);
    const seconds = numDuration % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    const totalDuration = Number(currentVideo.duration);
    if (isNaN(totalDuration) || totalDuration === 0) return 0;
    return Math.min((currentTime / totalDuration) * 100, 100);
  };

  if (!isActive) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        {currentVideo.videoId ? (
          <img
            src={currentVideo.thumbnail}
            alt={currentVideo.title}
            className="w-15 h-12 md:w-auto md:h-20 rounded-lg object-cover"
          />
        ) : (
          <div className="w-15 h-12 md:w-20 md:h-20 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
            <FaMusic className="w-6 h-6 text-gray-400" />
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-xs md:text-xl font-semibold text-black mb-1">{currentVideo.title}</h3>
          <p className="text-gray-600 mb-2 md:text-auto text-xs">{currentVideo.artist}</p>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FaYoutube className="w-4 h-4 text-red-500" />
              <span className="text-sm text-gray-500">YouTube</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-500">
              <FaHeart className="w-4 h-4" />
              <span className="text-sm">{currentVideo.votes}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[0.5rem] md:text-sm text-gray-500 mb-1">
            {formatTime(currentTime)} / {formatDuration(currentVideo.duration)}
          </div>
          <div className="w-14 md:w-24 h-1 bg-gray-200 rounded-full">
            <div 
              className="h-1 bg-slate-500 rounded-full transition-all duration-1000"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* YouTube Embed — always mounted to avoid removeChild errors */}
      <div className="aspect-video w-full relative" style={{ display: currentVideo.videoId ? 'block' : 'none' }}>
        <div
          ref={playerRef}
          className="w-full h-full rounded-lg"
        />
        {!isPlayerReady && currentVideo.videoId && (
          <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500 mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Loading video...</p>
            </div>
          </div>
        )}
      </div>

      {/* Empty State — shown when no video */}
      {!currentVideo.videoId && (
        <div className="aspect-video w-full bg-gray-50 rounded-lg flex flex-col items-center justify-center border border-gray-200 mt-2.5 pt-2.5 md:pt-0">
          <FaMusic className="w-8 h-8 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-1">
            Queue is empty
          </h3>
          <p className="text-sm text-gray-500">
            Add a song to start playing
          </p>
        </div>
      )}
    </div>
  )
}