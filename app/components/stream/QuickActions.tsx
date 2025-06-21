"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FaHeart, FaShare } from "react-icons/fa"
import { handleShare } from "./HandleShare"

interface QuickActionsProps {
  creatorId: string
}

export function QuickActions({ creatorId }: QuickActionsProps) {
  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="text-sm">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button variant="outline" size="sm" className="w-full justify-start">
          <FaHeart className="w-4 h-4 mr-2" />
          Follow Stream
        </Button>
        <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => handleShare(creatorId)}>
          <FaShare className="w-4 h-4 mr-2" />
          Share Stream
        </Button>
      </CardContent>
    </Card>
  )
}