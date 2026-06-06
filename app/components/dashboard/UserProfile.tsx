"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FaHeart, FaPen, FaSpotify, FaMusic, FaMicrophone } from "react-icons/fa"
import Link from "next/link"
import { useState, useEffect } from "react"
import { HiX } from "react-icons/hi"

interface UserListItem {
  id: string; name: string; username: string; avatar: string; favoriteGenre: string
}

function UserListModal({ title, userId, type, onClose }: {
  title: string; userId: string; type: "followers" | "following"; onClose: () => void
}) {
  const [users, setUsers] = useState<UserListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/users/${userId}/${type}`)
      .then(r => r.json())
      .then(d => setUsers(d[type] || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [userId, type])

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[70vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><HiX className="w-5 h-5" /></button>
        </div>
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">No users yet</div>
          ) : users.map(u => (
            <Link key={u.id} href={`/profile/${u.id}`} onClick={onClose}
              className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
              <Avatar className="w-10 h-10">
                <AvatarImage src={u.avatar} />
                <AvatarFallback className="bg-gray-100 text-gray-600 text-sm">{u.name?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 truncate">{u.name}</p>
                <p className="text-xs text-gray-500">@{u.username}</p>
              </div>
              {u.favoriteGenre && (
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{u.favoriteGenre}</span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

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
  favoriteGenre?: string
  favoriteSinger?: string
  spotifyUrl?: string
}

interface UserProfileProps {
  user: Profile
  jamCount: number
  onFollowUser: () => void
  onShareProfile: () => void
}

export function UserProfile({ user, jamCount, onFollowUser, onShareProfile }: UserProfileProps) {
  const [modal, setModal] = useState<"followers" | "following" | null>(null)

  return (
    <>
      <Card className="border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <Avatar className="w-20 h-20 flex-shrink-0">
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback className="bg-gray-100 text-gray-600 text-2xl">
                {user.name?.split(" ").map((n: string) => n[0]).join("") || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                <div>
                  <h1 className="text-xl font-bold text-black">{user.name}</h1>
                  <p className="text-sm text-gray-500">@{user.username}</p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/profile/${user.id}`}>
                    <Button size="sm" variant="outline" className="border-gray-300 text-gray-700 text-xs">
                      View Profile
                    </Button>
                  </Link>
                  <Link href="/settings/profile">
                    <Button size="sm" variant="outline" className="border-gray-300 text-gray-700 text-xs flex items-center gap-1.5">
                      <FaPen className="w-2.5 h-2.5" />Edit
                    </Button>
                  </Link>
                </div>
              </div>

              {user.bio && <p className="text-sm text-gray-700 mt-2 mb-3 leading-relaxed">{user.bio}</p>}

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                {user.favoriteGenre && (
                  <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                    <FaMusic className="w-2.5 h-2.5" />{user.favoriteGenre}
                  </span>
                )}
                {user.favoriteSinger && (
                  <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                    <FaMicrophone className="w-2.5 h-2.5" />{user.favoriteSinger}
                  </span>
                )}
                {user.spotifyUrl && (
                  <a href={user.spotifyUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full hover:bg-green-100 transition-colors">
                    <FaSpotify className="w-3 h-3" />Spotify
                  </a>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-5 text-sm">
                <button onClick={() => setModal("followers")} className="hover:opacity-70 transition-opacity">
                  <span className="font-bold text-black">{user.followers}</span>
                  <span className="text-gray-500 ml-1">followers</span>
                </button>
                <button onClick={() => setModal("following")} className="hover:opacity-70 transition-opacity">
                  <span className="font-bold text-black">{user.following}</span>
                  <span className="text-gray-500 ml-1">following</span>
                </button>
                <div>
                  <span className="font-bold text-black">{jamCount}</span>
                  <span className="text-gray-500 ml-1">jams</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaHeart className="w-3.5 h-3.5 text-red-400" />
                  <span className="font-bold text-black">{user.totalLikes}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {modal && (
        <UserListModal
          title={modal === "followers" ? "Followers" : "Following"}
          userId={user.id}
          type={modal}
          onClose={() => setModal(null)}
        />
      )}
    </>
  )
}