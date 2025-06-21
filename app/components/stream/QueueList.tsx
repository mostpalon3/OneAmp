"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BiMusic } from "react-icons/bi"
import { QueueItem } from "./QueueItem"
import { Song } from "@/lib/types/stream-types"

interface QueueListProps {
  queue: Song[]
  onVote: (songId: number | string, isUpvote: boolean) => void
}

export function QueueList({ queue, onVote }: QueueListProps) {
  if (queue.length === 0) {
    return (
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BiMusic className="w-5 h-5" />
            <span>Up Next</span>
            <Badge variant="outline" className="ml-2">
              0 songs
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <BiMusic className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No songs in queue</p>
            <p className="text-sm">Add a song to get started!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BiMusic className="w-5 h-5" />
          <span>Up Next</span>
          <Badge variant="outline" className="ml-2">
            {queue.length} songs
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {queue.map((song, index) => (
          <QueueItem
            key={`${song.submittedBy}-${song.id}`}
            song={song}
            index={index}
            onVote={onVote}
          />
        ))}
      </CardContent>
    </Card>
  )
}