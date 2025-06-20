"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FaYoutube, FaHeart } from "react-icons/fa"

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
}

export function YouTubePlayer({ currentVideo, isActive, onToggle }: YouTubePlayerProps) {
  if (!isActive) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <img
          src={currentVideo.thumbnail || "/placeholder.svg"}
          alt={currentVideo.title}
          className="w-20 h-20 rounded-lg object-cover"
        />
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-black mb-1">{currentVideo.title}</h3>
          <p className="text-gray-600 mb-2">{currentVideo.artist}</p>
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
          <div className="text-sm text-gray-500 mb-1">
            {currentVideo.currentTime} / {
            (() => {
              const minutes = Math.floor(Number(currentVideo.duration) / 60);
              const seconds = Number(currentVideo.duration) % 60;
              return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            })()
            }
          </div>
          <div className="w-24 h-1 bg-gray-200 rounded-full">
            <div className="w-1/3 h-1 bg-red-500 rounded-full"></div>
          </div>
        </div>
      </div>
      {/* YouTube Embed */}
      <div className="aspect-video w-full">
        <iframe
          src={`https://www.youtube.com/embed/${currentVideo.videoId}?autoplay=1&mute=1`}
          title={currentVideo.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full rounded-lg"
        ></iframe>
      </div>
    </div>
  )
}