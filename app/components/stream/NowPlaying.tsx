"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HiOutlineFire } from "react-icons/hi"
import { FaSpotify, FaYoutube } from "react-icons/fa"
import { SpotifyPlayer } from "../SpotifyPlayer"
import { YouTubePlayer } from "../YoutubePlayer"
import { CurrentVideo } from "@/app/lib/types/stream-types"

interface NowPlayingProps {
  currentPlaying: "spotify" | "youtube"
  setCurrentPlaying: (platform: "spotify" | "youtube") => void
  currentVideo: CurrentVideo
}

// Placeholder data for Spotify - replace with actual data when available
const currentSongPlaceholder = {
  id: 1,
  title: "No Spotify Track",
  artist: "Please add a Spotify track",
  duration: "0:00",
  currentTime: "0:00",
  platform: "spotify",
  albumArt: "/placeholder.svg?height=300&width=300",
  votes: 0,
  spotifyId: "", 
}

export function NowPlaying({ currentPlaying, setCurrentPlaying, currentVideo }: NowPlayingProps) {
  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <HiOutlineFire className="w-5 h-5 text-red-500" />
            <span>Now Playing</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant={currentPlaying === "spotify" ? "default" : "outline"}
              onClick={() => setCurrentPlaying("spotify")}
              className="h-8"
            >
              <FaSpotify className="w-4 h-4 mr-1" />
              Spotify
            </Button>
            <Button
              size="sm"
              variant={currentPlaying === "youtube" ? "default" : "outline"}
              onClick={() => setCurrentPlaying("youtube")}
              className="h-8"
            >
              <FaYoutube className="w-4 h-4 mr-1" />
              YouTube
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <SpotifyPlayer 
          currentSong={currentSongPlaceholder}
          isActive={currentPlaying === "spotify"}
          onToggle={() => setCurrentPlaying("spotify")}
        />
        <YouTubePlayer 
          currentVideo={currentVideo}
          isActive={currentPlaying === "youtube"}
          onToggle={() => setCurrentPlaying("youtube")}
        />
      </CardContent>
    </Card>
  )
}