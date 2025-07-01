"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FaPlay } from "react-icons/fa"

interface PlayNextButtonProps {
  onPlayNext: () => Promise<void>
  isLoading: boolean
  queueEmpty: boolean
}

export function PlayNextButton({ onPlayNext, isLoading,queueEmpty }: PlayNextButtonProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Play Next</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={onPlayNext}
          disabled={isLoading || queueEmpty}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
              Loading...
            </>
          ) : (
            <>
              <FaPlay className="w-4 h-4 mr-2" />
              Play Next
            </>
          )}
        </Button>
        <span className="text-xs text-gray-500">Note: For the first song added, manually press Play Next.</span>
      </CardContent>
    </Card>
  )
}