"use client"

import { Button } from "@/components/ui/button"
import { FaArrowUp, FaArrowDown, FaYoutube } from "react-icons/fa"
import { Song } from "@/app/lib/types/jam-types"
import { formatDurationFromString } from "@/app/lib/utils/format-utils"

interface QueueItemProps {
  song: Song
  index: number
  onVote: (songId: number | string, isUpvote: boolean) => void
}

export function QueueItem({ song, index, onVote }: QueueItemProps) {
  return (
    <div className="flex items-center space-x-6 md:space-x-4 md:p-3 p-0 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center space-x-3">
        <span className="text-[0.7rem] md:text-sm text-gray-400 w-6 text-center">{index + 1}</span>
        <img
          src={song.thumbnail}
          alt={song.title}
          className="md:w-12 md:h-12 w-10 h-8 rounded-sm object-cover"
        />
      </div>

      <div className="flex-1">
        <h4 className="font-medium md:text-sm text-[0.5rem] text-black">{song.title}</h4>
        <p className="text-[0.4rem] md:text-sm text-gray-600">{song.artist}</p>
        <div className="flex items-center space-x-3 mt-1">
          <div className="flex items-center space-x-1">
            <FaYoutube className="w-3 h-3 text-red-500" />
            <span className="md:text-xs text-[0.4rem] text-gray-500">
              {formatDurationFromString(song.duration)}
            </span>
          </div>
        </div>
          <span className="text-[0.5rem] w-full line-clamp-2 mt-0.5 md:text-xs text-gray-400">Added by @{song.submittedBy}</span>
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          <Button
            size="sm"
            variant={song.userVoted === "up" ? "default" : "outline"}
            className={`md:h-8 md:w-8 h-6 w-6 p-0 ${song.userVoted === "up"
                ? "bg-green-600 hover:bg-green-700"
                : "hover:bg-green-50 hover:border-green-300"
              }`}
            onClick={() => onVote(song.id, true)}
          >
            <FaArrowUp
              className={`md:w-3 md:h-3 w-1 h-1 ${song.userVoted === "up" ? "text-white" : "text-green-600"}`}
            />
          </Button>
          <span className="text-sm font-medium text-gray-700 min-w-[2rem] text-center">{song.votes}</span>
          <Button
            size="sm"
            variant={song.userVoted === "down" ? "default" : "outline"}
            className={`md:h-8 md:w-8 h-6 w-6 p-0 ${song.userVoted === "down"
                ? "bg-red-600 hover:bg-red-700"
                : "hover:bg-red-50 hover:border-red-300"
              }`}
            onClick={() => onVote(song.id, false)}
          >
            <FaArrowDown
              className={`md:w-3 md:h-3 w-1 h-1 ${song.userVoted === "down" ? "text-white" : "text-red-600"}`}
            />
          </Button>
        </div>
      </div>
    </div>
  )
}