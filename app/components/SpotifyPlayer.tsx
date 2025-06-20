"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FaSpotify, FaHeart } from "react-icons/fa"

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
}

export function SpotifyPlayer({ currentSong, isActive, onToggle }: SpotifyPlayerProps) {
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
            {currentSong.currentTime} / {currentSong.duration}
          </div>
          <div className="w-24 h-1 bg-gray-200 rounded-full">
            <div className="w-1/2 h-1 bg-green-500 rounded-full"></div>
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