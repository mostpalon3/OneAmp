"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  FaSpotify, FaMusic, FaHeart, FaUserPlus, FaUserCheck,
  FaUsers, FaMicrophone, FaPen
} from "react-icons/fa"
import { BiMusic } from "react-icons/bi"
import { HiX } from "react-icons/hi"

interface ProfileData {
  userId: string
  username: string
  bio: string
  image: string
  favoriteGenre: string
  favoriteSinger: string | null
  spotifyUrl: string | null
  followersCount: number
  followingCount: number
  isFollowing: boolean
  jamCount: number
  totalLikes: number
  recentJams: { id: string; title: string; genre: string; likesCount: number }[]
  user: { name: string; id: string }
}

interface UserListItem {
  id: string; name: string; username: string; avatar: string; favoriteGenre: string
}

function UserListModal({ title, users, onClose }: { title: string; users: UserListItem[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[70vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><HiX className="w-5 h-5" /></button>
        </div>
        <div className="overflow-y-auto flex-1">
          {users.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FaUsers className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No users yet</p>
            </div>
          ) : users.map(user => (
            <Link key={user.id} href={`/profile/${user.id}`} onClick={onClose}
              className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
              <Avatar className="w-10 h-10">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-gray-100 text-gray-600 text-sm">{user.name?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500">@{user.username}</p>
              </div>
              {user.favoriteGenre && (
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{user.favoriteGenre}</span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const params = useParams()
  const userId = params.userId as string

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFollowLoading, setIsFollowLoading] = useState(false)
  const [showFollowers, setShowFollowers] = useState(false)
  const [showFollowing, setShowFollowing] = useState(false)
  const [followersList, setFollowersList] = useState<UserListItem[]>([])
  const [followingList, setFollowingList] = useState<UserListItem[]>([])
  // Current logged-in user's actual DB userId
  const [myUserId, setMyUserId] = useState<string | null>(null)

  // Fetch current user's DB id to determine own profile
  useEffect(() => {
    if (!session?.user?.email) return
    fetch("/api/complete-profile")
      .then(r => r.json())
      .then(d => { if (d.user?.id) setMyUserId(d.user.id) })
      .catch(() => {})
  }, [session])

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch(`/api/users/${userId}/profile`)
      if (res.ok) {
        const data = await res.json()
        setProfile(data.profile)
      }
    } catch {}
    finally { setIsLoading(false) }
  }, [userId])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  const handleFollowToggle = async () => {
    if (!profile || isFollowLoading) return
    setIsFollowLoading(true)
    const wasFollowing = profile.isFollowing
    setProfile(prev => prev ? {
      ...prev,
      isFollowing: !wasFollowing,
      followersCount: prev.followersCount + (wasFollowing ? -1 : 1),
    } : prev)
    try {
      const res = await fetch(`/api/users/${userId}/follow`, { method: wasFollowing ? "DELETE" : "POST" })
      if (!res.ok) throw new Error()
    } catch {
      setProfile(prev => prev ? {
        ...prev,
        isFollowing: wasFollowing,
        followersCount: prev.followersCount + (wasFollowing ? 1 : -1),
      } : prev)
    } finally {
      setIsFollowLoading(false)
    }
  }

  const openFollowers = async () => {
    const res = await fetch(`/api/users/${userId}/followers`)
    if (res.ok) setFollowersList((await res.json()).followers || [])
    setShowFollowers(true)
  }

  const openFollowing = async () => {
    const res = await fetch(`/api/users/${userId}/following`)
    if (res.ok) setFollowingList((await res.json()).following || [])
    setShowFollowing(true)
  }

  const isOwnProfile = myUserId === userId

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Profile not found</p>
          <Link href="/" className="text-black underline text-sm">Go home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimal header */}
      <header className="bg-white border-b border-gray-200 px-4 h-14 flex items-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center">
            <BiMusic className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900">OneAmp</span>
        </Link>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Profile card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-5">
          {/* Cover gradient */}
          <div className="h-24 bg-gradient-to-br from-gray-900 to-gray-600" />

          <div className="px-6 pb-6">
            {/* Avatar overlapping cover */}
            <div className="flex items-end justify-between -mt-12 mb-4">
              <Avatar className="w-20 h-20 ring-4 ring-white">
                <AvatarImage src={profile.image} />
                <AvatarFallback className="bg-gray-200 text-gray-700 text-2xl">
                  {profile.user.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>

              {/* Action buttons */}
              <div className="flex gap-2 mt-14">
                {isOwnProfile ? (
                  <Link href="/settings/profile">
                    <Button size="sm" variant="outline" className="border-gray-300 text-gray-700 flex items-center gap-1.5">
                      <FaPen className="w-3 h-3" />Edit Profile
                    </Button>
                  </Link>
                ) : session?.user && (
                  <Button
                    onClick={handleFollowToggle}
                    disabled={isFollowLoading}
                    size="sm"
                    className={profile.isFollowing
                      ? "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                      : "bg-black text-white hover:bg-gray-800"
                    }
                  >
                    {profile.isFollowing
                      ? <><FaUserCheck className="w-3.5 h-3.5 mr-1.5" />Following</>
                      : <><FaUserPlus className="w-3.5 h-3.5 mr-1.5" />Follow</>
                    }
                  </Button>
                )}
              </div>
            </div>

            {/* Name & username */}
            <h1 className="text-xl font-bold text-gray-900">{profile.user.name}</h1>
            <p className="text-sm text-gray-500 mb-3">@{profile.username}</p>

            {/* Bio */}
            {profile.bio && <p className="text-sm text-gray-700 leading-relaxed mb-4">{profile.bio}</p>}

            {/* Stats row */}
            <div className="flex gap-5 text-sm mb-4">
              <button onClick={openFollowers} className="hover:opacity-70 transition-opacity">
                <span className="font-bold text-gray-900">{profile.followersCount}</span>
                <span className="text-gray-500 ml-1">followers</span>
              </button>
              <button onClick={openFollowing} className="hover:opacity-70 transition-opacity">
                <span className="font-bold text-gray-900">{profile.followingCount}</span>
                <span className="text-gray-500 ml-1">following</span>
              </button>
              <div>
                <span className="font-bold text-gray-900">{profile.jamCount}</span>
                <span className="text-gray-500 ml-1">jams</span>
              </div>
              <div className="flex items-center gap-1">
                <FaHeart className="w-3.5 h-3.5 text-red-400" />
                <span className="font-bold text-gray-900">{profile.totalLikes}</span>
              </div>
            </div>

            {/* Music taste tags */}
            <div className="flex flex-wrap gap-2">
              {profile.favoriteGenre && (
                <span className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full">
                  <FaMusic className="w-3 h-3 text-gray-500" />{profile.favoriteGenre}
                </span>
              )}
              {profile.favoriteSinger && (
                <span className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full">
                  <FaMicrophone className="w-3 h-3 text-gray-500" />{profile.favoriteSinger}
                </span>
              )}
              {profile.spotifyUrl && (
                <a href={profile.spotifyUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-full hover:bg-green-100 transition-colors font-medium">
                  <FaSpotify className="w-3.5 h-3.5" />Spotify
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Recent Jams */}
        {profile.recentJams.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BiMusic className="w-4 h-4" />Recent Jams
            </h2>
            <div className="grid gap-2">
              {profile.recentJams.map(jam => (
                <Link key={jam.id} href={`/jams/${jam.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{jam.title}</p>
                    <p className="text-xs text-gray-500">{jam.genre}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <FaHeart className="w-3 h-3" />{jam.likesCount}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {showFollowers && (
        <UserListModal title="Followers" users={followersList} onClose={() => setShowFollowers(false)} />
      )}
      {showFollowing && (
        <UserListModal title="Following" users={followingList} onClose={() => setShowFollowing(false)} />
      )}
    </div>
  )
}
