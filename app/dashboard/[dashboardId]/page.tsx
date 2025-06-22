"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Link from "next/link"
import {
  FaPlus,
  FaUsers,
  FaPlay,
  FaHeart,
  FaShare,
  FaClock,
  FaEye,
  FaTrash,
  FaUserPlus,
  FaMusic,
  FaHashtag,
} from "react-icons/fa"
import { BiMusic, BiTrendingUp } from "react-icons/bi"
import { HiOutlineSparkles } from "react-icons/hi"

// Mock user data
const currentUser = {
  id: 1,
  name: "Alex Johnson",
  username: "@alexjohnson",
  bio: "Music enthusiast and DJ. Creating vibes since 2020. Electronic • House • Progressive",
  avatar: "/placeholder.svg?height=120&width=120",
  followers: 1247,
  following: 892,
  totalJams: 45,
  totalLikes: 3420,
  isFollowing: false,
}

// Mock data for user's jams
const userJams = [
  {
    id: 1,
    name: "Late Night Vibes",
    createdAt: "2024-01-15",
    status: "live",
    viewers: 247,
    duration: "2h 15m",
    genre: "Electronic",
    totalSongs: 23,
    totalVotes: 156,
  },
  {
    id: 2,
    name: "Chill Sunday Session",
    createdAt: "2024-01-14",
    status: "ended",
    viewers: 89,
    duration: "1h 42m",
    genre: "Chill",
    totalSongs: 15,
    totalVotes: 67,
  },
  {
    id: 3,
    name: "Friday Night Party",
    createdAt: "2024-01-12",
    status: "ended",
    viewers: 312,
    duration: "3h 8m",
    genre: "Dance",
    totalSongs: 34,
    totalVotes: 289,
  },
  {
    id: 4,
    name: "Acoustic Afternoon",
    createdAt: "2024-01-10",
    status: "ended",
    viewers: 156,
    duration: "1h 30m",
    genre: "Acoustic",
    totalSongs: 12,
    totalVotes: 78,
  },
]

export default function Dashboard() {
  const [jamName, setJamName] = useState("")
  const [jamId, setJamId] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false)
  const [jams, setJams] = useState(userJams)
  const [user, setUser] = useState(currentUser)

  const handleCreateJam = async () => {
    if (!jamName.trim()) return

    setIsCreating(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const newJam = {
      id: Date.now(),
      name: jamName,
      createdAt: new Date().toISOString().split("T")[0],
      status: "live" as const,
      viewers: 1,
      duration: "0m",
      genre: "Mixed",
      totalSongs: 0,
      totalVotes: 0,
    }

    setJams([newJam, ...jams])
    setIsCreating(false)
    setJamName("")
    setIsCreateDialogOpen(false)

    // Redirect to the jam page
    window.location.href = "/dashboard"
  }

  const handleJoinJam = async () => {
    if (!jamId.trim()) return

    setIsJoining(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log("Joining jam with ID:", jamId)

    setIsJoining(false)
    setJamId("")
    setIsJoinDialogOpen(false)

    // Redirect to the jam page
    window.location.href = "/dashboard"
  }

  const handleDeleteJam = (jamId: number) => {
    setJams(jams.filter((jam) => jam.id !== jamId))
  }

  const handleFollowUser = () => {
    setUser((prev) => ({
      ...prev,
      isFollowing: !prev.isFollowing,
      followers: prev.isFollowing ? prev.followers - 1 : prev.followers + 1,
    }))
  }

  const handleShareProfile = () => {
    navigator.clipboard.writeText(`${window.location.origin}/profile/${user.username}`)
    // In a real app, show a toast notification
    alert("Profile link copied to clipboard!")
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <BiMusic className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-black">OneAmp</span>
          </Link>

          <div className="flex items-center space-x-4">
            <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                  <FaHashtag className="w-4 h-4 mr-2" />
                  Join Jam
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white border-gray-200">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-black">Join Jam</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="jam-id" className="text-gray-700">
                      Jam ID
                    </Label>
                    <Input
                      id="jam-id"
                      placeholder="Enter jam ID..."
                      value={jamId}
                      onChange={(e) => setJamId(e.target.value)}
                      className="border-gray-300 focus:border-black"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && jamId.trim()) {
                          handleJoinJam()
                        }
                      }}
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsJoinDialogOpen(false)}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleJoinJam}
                      disabled={!jamId.trim() || isJoining}
                      className="bg-black text-white hover:bg-gray-800"
                    >
                      {isJoining ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Joining...
                        </>
                      ) : (
                        <>
                          <FaPlay className="mr-2 w-4 h-4" />
                          Join Jam
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-black text-white hover:bg-gray-800">
                  <FaPlus className="w-4 h-4 mr-2" />
                  Create Jam
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white border-gray-200">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-black">Create New Jam</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="jam-name" className="text-gray-700">
                      Jam Name
                    </Label>
                    <Input
                      id="jam-name"
                      placeholder="Enter your jam name..."
                      value={jamName}
                      onChange={(e) => setJamName(e.target.value)}
                      className="border-gray-300 focus:border-black"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && jamName.trim()) {
                          handleCreateJam()
                        }
                      }}
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateJam}
                      disabled={!jamName.trim() || isCreating}
                      className="bg-black text-white hover:bg-gray-800"
                    >
                      {isCreating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <FaPlus className="mr-2 w-4 h-4" />
                          Create Jam
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 lg:px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* User Profile Section */}
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-start space-x-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback className="bg-gray-100 text-gray-600 text-2xl">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
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
                          onClick={handleFollowUser}
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
                          onClick={handleShareProfile}
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
                        <span className="font-semibold text-black">{user.totalJams}</span>
                        <span className="text-gray-600">jams</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FaHeart className="w-4 h-4 text-gray-600" />
                        <span className="font-semibold text-black">{user.totalLikes.toLocaleString()}</span>
                        <span className="text-gray-600">likes</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* My Jams */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-black flex items-center space-x-2">
                  <FaMusic className="w-6 h-6" />
                  <span>My Jams</span>
                  <Badge variant="outline" className="ml-2 border-gray-300 text-gray-600">
                    {jams.length} total
                  </Badge>
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {jams.map((jam) => (
                  <Card key={jam.id} className="border-gray-200 hover:border-gray-300 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-semibold text-black">{jam.name}</h3>
                            <Badge
                              variant={jam.status === "live" ? "default" : "outline"}
                              className={
                                jam.status === "live"
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : "border-gray-300 text-gray-600"
                              }
                            >
                              {jam.status === "live" ? (
                                <>
                                  <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse mr-1"></div>
                                  LIVE
                                </>
                              ) : (
                                "ENDED"
                              )}
                            </Badge>
                            <Badge variant="outline" className="border-gray-300 text-gray-600">
                              {jam.genre}
                            </Badge>
                          </div>

                          <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
                            <div className="flex items-center space-x-1">
                              <FaClock className="w-4 h-4" />
                              <span>Created {jam.createdAt}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <FaUsers className="w-4 h-4" />
                              <span>{jam.viewers} viewers</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <FaEye className="w-4 h-4" />
                              <span>{jam.duration}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>{jam.totalSongs} songs</span>
                            <span>{jam.totalVotes} votes</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          {jam.status === "live" && (
                            <Button size="sm" className="bg-black text-white hover:bg-gray-800">
                              <FaPlay className="w-4 h-4 mr-2" />
                              Enter Jam
                            </Button>
                          )}

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                              >
                                <FaTrash className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-white border-gray-200">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-black">Delete Jam</AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-600">
                                  Are you sure you want to delete "{jam.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="border-gray-300 text-gray-700 hover:bg-gray-50">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteJam(jam.id)}
                                  className="bg-red-600 text-white hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {jams.length === 0 && (
                  <Card className="border-gray-200 border-dashed">
                    <CardContent className="p-12 text-center">
                      <FaMusic className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">No jams yet</h3>
                      <p className="text-gray-500 mb-4">Create your first jam to get started!</p>
                      <Button
                        onClick={() => setIsCreateDialogOpen(true)}
                        className="bg-black text-white hover:bg-gray-800"
                      >
                        <FaPlus className="w-4 h-4 mr-2" />
                        Create Your First Jam
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* How It Works */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-black">
                  <HiOutlineSparkles className="w-5 h-5" />
                  <span>How Jams Work</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white font-bold text-xs">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-black text-sm">Create Your Jam</h4>
                      <p className="text-xs text-gray-600">Start a new music session with a custom name</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white font-bold text-xs">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-black text-sm">Add Music</h4>
                      <p className="text-xs text-gray-600">Share YouTube and Spotify links to build your queue</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white font-bold text-xs">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-black text-sm">Let Others Vote</h4>
                      <p className="text-xs text-gray-600">Your audience votes on what plays next</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Platform Stats */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-black text-sm">Platform Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Streamers</span>
                  <span className="font-semibold text-black">1,247</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Jams Today</span>
                  <span className="font-semibold text-black">3,892</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Songs Played</span>
                  <span className="font-semibold text-black">12,456</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Votes Cast</span>
                  <span className="font-semibold text-black">45,123</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-sm text-black">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <FaHeart className="w-4 h-4 mr-2" />
                  My Favorites
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <BiTrendingUp className="w-4 h-4 mr-2" />
                  Trending Jams
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <FaUsers className="w-4 h-4 mr-2" />
                  Following
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
