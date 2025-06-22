"use client"

import { FaSpotify, FaHeart } from "react-icons/fa"
import { useEffect, useState } from "react"

interface SpotifyPlayerProps {
  currentSong: {
    id: number
    title: string
    artist: string
    duration: string
    currentTime: string
    platform: string
    albumArt: string
    votes: number
    spotifyId: string
  }
  isActive: boolean
  onToggle: () => void
  onTrackEnd?: () => void
  onTimeUpdate?: (currentTime: number) => void
}

export function SpotifyPlayer({ currentSong, isActive, onToggle, onTrackEnd, onTimeUpdate }: SpotifyPlayerProps) {
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    // Simulate timer for Spotify (since we can't access Spotify player state directly from iframe)
    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const newTime = prev + 1;
        onTimeUpdate?.(newTime);
        
        // Convert duration string to seconds for comparison
        const durationInSeconds = parseDurationToSeconds(currentSong.duration);
        if (newTime >= durationInSeconds && durationInSeconds > 0) {
          onTrackEnd?.();
          return 0;
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, currentSong.duration, onTimeUpdate, onTrackEnd]);

  const parseDurationToSeconds = (duration: string): number => {
    const parts = duration.split(':');
    if (parts.length === 2) {
      return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }
    return 0;
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    const totalDuration = parseDurationToSeconds(currentSong.duration);
    if (totalDuration === 0) return 0;
    return Math.min((currentTime / totalDuration) * 100, 100);
  };

  if (!isActive) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <img
          src={currentSong.albumArt || "/placeholder.svg"}
          alt={currentSong.title}
          className="w-20 h-20 rounded-lg object-cover"
        />
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-black mb-1">{currentSong.title}</h3>
          <p className="text-gray-600 mb-2">{currentSong.artist}</p>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FaSpotify className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-500">Spotify</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-500">
              <FaHeart className="w-4 h-4" />
              <span className="text-sm">{currentSong.votes}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500 mb-1">
            {formatTime(currentTime)} / {currentSong.duration}
          </div>
          <div className="w-24 h-1 bg-gray-200 rounded-full">
            <div 
              className="h-1 bg-green-500 rounded-full transition-all duration-1000"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
        </div>
      </div>
      {/* Spotify Embed */}
      <div className="w-full">
        <iframe
          src={`https://open.spotify.com/embed/track/${currentSong.spotifyId}?utm_source=generator&theme=0`}
          width="100%"
          height="152"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="rounded-lg"
        ></iframe>
      </div>
    </div>
  )
}