"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HiOutlineSparkles } from "react-icons/hi"
import { JamStats as JamStatsType } from "@/app/lib/types/jam-types"

interface JamStats {
  stats: JamStatsType
}

export function JamStats({ stats }: JamStats) {
  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <HiOutlineSparkles className="w-4 h-4" />
          <span>Jam Stats</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total Votes</span>
          <span className="font-semibold text-black">{stats.totalVotes}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Songs in Queue</span>
          <span className="font-semibold text-black">{stats.songsInQueue}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">YouTube Videos</span>
          <span className="font-semibold text-black">{stats.youtubeVideos}</span>
        </div>
      </CardContent>
    </Card>
  )
}