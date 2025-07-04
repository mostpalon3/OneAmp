"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FaUserPlus, FaShare, FaHeart } from "react-icons/fa"

export interface Profile {
  id: any
  name: any
  username: any
  bio: string
  avatar: any
  followers: number
  following: number
  totalJams: number
  totalLikes: number
  isFollowing: boolean
}

interface UserProfileProps {
  user: Profile
  jamCount: number
  onFollowUser: () => void
  onShareProfile: () => void
}

export function UserProfile({ user, jamCount, onFollowUser, onShareProfile }: UserProfileProps) {
  return (
    <Card className="border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-start space-x-6">
          <Avatar className="w-24 h-24">
            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
            <AvatarFallback className="bg-gray-100 text-gray-600 text-2xl">
              {user.name
                .split(" ")
                .map((n: any[]) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h1 className="text-2xl font-bold text-black">{user.name}</h1>
                <p className="text-gray-600">{user.username}</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  onClick={onFollowUser}
                  variant={user.isFollowing ? "outline" : "default"}
                  className={
                    user.isFollowing
                      ? "border-gray-300 text-gray-700 hover:bg-gray-50"
                      : "bg-black text-white hover:bg-gray-800"
                  }
                >
                  <FaUserPlus className="w-4 h-4 mr-2" />
                  {user.isFollowing ? "Following" : "Follow"}
                </Button>
                <Button
                  variant="outline"
                  onClick={onShareProfile}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <FaShare className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <p className="text-gray-700 mb-4">{user.bio}</p>

            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-1">
                <span className="font-semibold text-black">{user.followers.toLocaleString()}</span>
                <span className="text-gray-600">followers</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="font-semibold text-black">{user.following.toLocaleString()}</span>
                <span className="text-gray-600">following</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="font-semibold text-black">{jamCount}</span>
                <span className="text-gray-600">jams</span>
              </div>
              <div className="flex items-center space-x-1">
                <FaHeart className="w-4 h-4 text-gray-600" />
                <span className="font-semibold text-black">{user.totalLikes}</span>
                <span className="text-gray-600">likes</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}