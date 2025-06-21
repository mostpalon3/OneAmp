"use client"

import { Button } from "@/components/ui/button"
import { FaArrowUp, FaArrowDown, FaSpotify, FaYoutube } from "react-icons/fa"
import { Song } from "@/app/lib/types/stream-types"
import { formatDurationFromString } from "@/app/lib/utils/format-utils"

interface QueueItemProps {
  song: Song
  index: number
  onVote: (songId: number | string, isUpvote: boolean) => void
}

export function QueueItem({ song, index, onVote }: QueueItemProps) {
  return (
    <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center space-x-3">
        <span className="text-sm text-gray-400 w-6 text-center">{index + 1}</span>
        <img
          src={song.platform === "youtube" ? song.thumbnail : song.albumArt || "/placeholder.svg"}
          alt={song.title}
          className="w-12 h-12 rounded-lg object-cover"
        />
      </div>

      <div className="flex-1">
        <h4 className="font-medium text-black">{song.title}</h4>
        <p className="text-sm text-gray-600">{song.artist}</p>
        <div className="flex items-center space-x-3 mt-1">
          <div className="flex items-center space-x-1">
            {song.platform === "spotify" ? (
              <FaSpotify className="w-3 h-3 text-green-500" />
            ) : (
              <FaYoutube className="w-3 h-3 text-red-500" />
            )}
            <span className="text-xs text-gray-500">
              {formatDurationFromString(song.duration)}
            </span>
          </div>
          <span className="text-xs text-gray-400">by @{song.submittedBy}</span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          <Button
            size="sm"
            variant={song.userVoted === "up" ? "default" : "outline"}
            className={`h-8 w-8 p-0 ${song.userVoted === "up"
                ? "bg-green-600 hover:bg-green-700"
                : "hover:bg-green-50 hover:border-green-300"
              }`}
            onClick={() => onVote(song.id, true)}
          >
            <FaArrowUp
              className={`w-3 h-3 ${song.userVoted === "up" ? "text-white" : "text-green-600"}`}
            />
          </Button>
          <span className="text-sm font-medium text-gray-700 min-w-[2rem] text-center">{song.votes}</span>
          <Button
            size="sm"
            variant={song.userVoted === "down" ? "default" : "outline"}
            className={`h-8 w-8 p-0 ${song.userVoted === "down"
                ? "bg-red-600 hover:bg-red-700"
                : "hover:bg-red-50 hover:border-red-300"
              }`}
            onClick={() => onVote(song.id, false)}
          >
            <FaArrowDown
              className={`w-3 h-3 ${song.userVoted === "down" ? "text-white" : "text-red-600"}`}
            />
          </Button>
        </div>
      </div>
    </div>
  )
}