"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  FaTrash,
  FaUserPlus,
  FaMusic,
  FaHashtag,
  FaCalendarAlt,
} from "react-icons/fa"
import { BiMusic, BiTrendingUp } from "react-icons/bi"
import { HiOutlineSparkles } from "react-icons/hi"
import { useRouter } from "next/navigation"
import { AppBar } from "@/app/components/AppBar"
import { Redirect } from "@/app/components/Redirect"
import { useJamCode } from '../../lib/hooks/useJamCode';
import toast from "react-hot-toast"

// Mock user data
const currentUser = {
  id: 1,
  name: "Luffy",
  username: "@LuffyTheKingofThePirates",
  bio: "Sun god nika, the king of the pirates! Join me on my adventures to find the One Piece and become the Pirate King!",
  avatar: "/images/luffy.jpeg?height=120&width=120",
  followers: 1247,
  following: 892,
  totalJams: 45,
  totalLikes: 3420,
  isFollowing: false,
}

// Genre options for the select
const genres = [
  "Electronic",
  "Hip-Hop",
  "Pop",
  "Rock",
  "Jazz",
  "Classical",
  "R&B",
  "Country",
  "Reggae",
  "Blues",
  "Folk",
  "Indie",
  "Dance",
  "House",
  "Techno",
  "Ambient",
  "Chill",
  "Acoustic",
  "Mixed",
]

export default function Dashboard() {
  const [jamName, setJamName] = useState("")
  const [jamGenre, setJamGenre] = useState("")
  const [jamId, setJamId] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false)
  type Jam = {
    id: number
    name: string
    createdAt: string
    status: string
    viewers: number
    duration: string
    genre: string
    totalSongs: number
    totalVotes: number
  }
  const [jams, setJams] = useState<Jam[]>([])
  const [user, setUser] = useState(currentUser)
  const router = useRouter();
  const { isValidCode, joinJam } = useJamCode();
  const [jamArray, setJamArray] = useState<string[]>([])

  async function fetchUserProfile() {
    try {
      const response = await fetch("/api/complete-profile", {
        method: "GET",
      })
      if (!response.ok) {
        throw new Error("Failed to fetch user profile")
      }
      const data = await response.json()

      const userDetails = {
        id: data.profile.id,
        name: data.user.name,
        username: data.profile.username,
        bio: "Your bio goes here. Share something about yourself!",
        avatar: data.profile.image,
        followers: 1247,
        following: 892,
        totalJams: jams.length,
        totalLikes: 3420,
        isFollowing: false,
      }
      setUser(userDetails)
    } catch (error) {
      console.error("Error fetching user profile:", error)
      throw error
    }
  }
  useEffect(() => {
    // Fetch user profile when the component mounts
    fetchUserProfile()
  }, [setJams,jams,])

  async function handleCreateJam() {
    if (!jamName.trim() || !jamGenre) return

    try{
    setIsCreating(true)
    const response = await fetch("/api/jams", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(
      {
        title:jamName.trim()
      , genre: jamGenre
    }),
  })
  if (!response.ok) {
    throw new Error("Failed to create jam")
  }
}catch (error) {
    console.error("Error creating jam:", error)
    throw error
  }finally {
    setIsCreating(false)
  }
  setJamName("")
  setJamGenre("")
  setIsCreateDialogOpen(false)
  await fetchAllJams()
}
async function fetchAllJams() {
  try {
    const response = await fetch("/api/jams",
      {
        method: "GET",
      }
    )
    if (!response.ok) {
      throw new Error("Failed to fetch jams")
    }
    const jams = await response.json()
    const newJam = jams.jams.map((jam: any) => {
      const date = new Date(jam.createdAt)
      const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }
      const formattedDate = date.toLocaleDateString(undefined, options)
      return {
      id: jam.id,
      name: jam.title,
      createdAt: formattedDate, // e.g. "Jun 2024"
      status: "live",
      viewers: 156,
      duration: "1h 30m",
      genre: jam.genre,
      totalSongs: 12,
      totalVotes: jam.likes,
      }
    })
    setJams(newJam)
    console.log("Jams state updated:", jams)
    setIsCreating(false)
    setJamName("")
    setJamGenre("")
    setIsCreateDialogOpen(false)
  } catch (error) {
    console.error("Error fetching jams:", error)
    throw error
  }
}
useEffect(() => {
  // Fetch all jams when the component mounts
  fetchAllJams()
}, [])

  const handleJoinJam = async (code: string) => {
    if (!jamId.trim()) return

    setIsJoining(true)

    const validCode = isValidCode(code);
    if (!validCode) {
      toast.error("Invalid jam code. Please enter a valid code.");
      setIsJoining(false);
      return;
    }else{
      toast.success("Joining jam with code: " + code);
      const url = joinJam(code, jamArray);
      setIsJoining(false)
      setJamId("")
      setIsJoinDialogOpen(false)
      // Redirect to the jam page
      if (url) {
        router.push(url);
      } else {
        toast.error("Could not join jam. Invalid URL.");
      }
    }
  }


  const enterJam = (jamId: number) => {
    router.push(`/jams/${jamId}`)
  }


  const handleDeleteJam = async (jamId: number) => {
    const response = await fetch(`/api/jams/${jamId}`, {
      method: "DELETE",
    })
    if (!response.ok) {
      console.error("Failed to delete jam")
      return
    }
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

  const getGenreColor = (genre: string) => {
    const colors: { [key: string]: string } = {
      Electronic: "bg-purple-100 text-purple-800 border-purple-200",
      "Hip-Hop": "bg-orange-100 text-orange-800 border-orange-200",
      Pop: "bg-pink-100 text-pink-800 border-pink-200",
      Rock: "bg-red-100 text-red-800 border-red-200",
      Jazz: "bg-blue-100 text-blue-800 border-blue-200",
      Classical: "bg-indigo-100 text-indigo-800 border-indigo-200",
      "R&B": "bg-yellow-100 text-yellow-800 border-yellow-200",
      Country: "bg-green-100 text-green-800 border-green-200",
      Chill: "bg-teal-100 text-teal-800 border-teal-200",
      Dance: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200",
      Acoustic: "bg-amber-100 text-amber-800 border-amber-200",
      Mixed: "bg-gray-100 text-gray-800 border-gray-200",
    }
    return colors[genre] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Redirect/>
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
                          // handleJoinJam(jamId)
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
                      // onClick={handleJoinJam}
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
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jam-genre" className="text-gray-700">
                      Genre
                    </Label>
                    <Select value={jamGenre} onValueChange={setJamGenre}>
                      <SelectTrigger className="border-gray-300 focus:border-black">
                        <SelectValue placeholder="Select a genre..." />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
                        {genres.map((genre) => (
                          <SelectItem key={genre} value={genre} className="hover:bg-gray-50">
                            {genre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsCreateDialogOpen(false)
                        setJamName("")
                        setJamGenre("")
                      }}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateJam}
                      disabled={!jamName.trim() || !jamGenre || isCreating}
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

              <div className="grid md:grid-cols-2 gap-6">
                {jams.map((jam) => (
                  <Card
                    key={jam.id}
                    className="border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-lg group"
                  >
                    <CardContent className="p-0">
                      {/* Header with gradient background */}
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-t-lg">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-black mb-2 group-hover:text-gray-700 transition-colors">
                              {jam.name}
                            </h3>
                            <div className="flex items-center space-x-2 mb-3">
                              <Badge
                                variant={jam.status === "live" ? "default" : "outline"}
                                className={
                                  jam.status === "live"
                                    ? "bg-green-500 text-white hover:bg-green-600"
                                    : "border-gray-300 text-gray-600"
                                }
                              >
                                {jam.status === "live" ? (
                                  <>
                                    <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-1"></div>
                                    LIVE
                                  </>
                                ) : (
                                  "ENDED"
                                )}
                              </Badge>
                              <Badge className={getGenreColor(jam.genre)}>{jam.genre}</Badge>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            
                              <Button size="sm" className="bg-black text-white hover:bg-gray-800" onClick={() => enterJam(jam.id)}>
                                <FaPlay className="w-3 h-3 mr-1" />
                                Enter
                              </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                                >
                                  <FaTrash className="w-3 h-3" />
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
                      </div>

                      {/* Stats section */}
                      <div className="p-6 pt-0">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <FaUsers className="w-4 h-4" />
                            <span className="font-medium">{jam.viewers}</span>
                            <span>viewers</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <FaClock className="w-4 h-4" />
                            <span className="font-medium">{jam.duration}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <FaMusic className="w-4 h-4" />
                            <span className="font-medium">{jam.totalSongs}</span>
                            <span>songs</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <FaHeart className="w-4 h-4" />
                            <span className="font-medium">{jam.totalVotes}</span>
                            <span>votes</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <FaCalendarAlt className="w-3 h-3" />
                            <span>Created {jam.createdAt}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {jams.length === 0 && (
                  <div className="md:col-span-2">
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
                  </div>
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
                      <p className="text-xs text-gray-600">Start a new music session with a custom name and genre</p>
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
