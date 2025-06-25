"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HiOutlineFire } from "react-icons/hi"
import { FaYoutube } from "react-icons/fa"
import { YouTubePlayer } from "./YoutubePlayer"
import { CurrentVideo } from "@/app/lib/types/jam-types"

interface NowPlayingProps {
  currentVideo: CurrentVideo
  onVideoEnd?: () => void
  onTimeUpdate?: (currentTime: number) => void
}

export function NowPlaying({ currentVideo, onVideoEnd, onTimeUpdate }: NowPlayingProps) {
  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <HiOutlineFire className="w-5 h-5 text-red-500" />
            <span>Now Playing</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <FaYoutube className="w-4 h-4 text-red-500" />
              <span>YouTube</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <YouTubePlayer 
          currentVideo={currentVideo}
          isActive={true}
          onToggle={() => {}}
          onVideoEnd={onVideoEnd}
          onTimeUpdate={onTimeUpdate}
        />
      </CardContent>
    </Card>
  )
}