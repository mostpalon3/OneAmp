"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Redirect } from "@/app/components/Redirect"
import { DashboardHeader } from "@/app/components/dashboard/DashboardHeader"
import { UserProfile } from "@/app/components/dashboard/UserProfile"
import { JamsList } from "@/app/components/dashboard/JamsList"
import { DashboardSidebar } from "@/app/components/dashboard/DashboardSidebar"
import { Profile, Jam, genres } from "@/app/components/dashboard/types"

export default function Dashboard() {
  const [jamName, setJamName] = useState("")
  const [jamGenre, setJamGenre] = useState("")
  const [jamId, setJamId] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false)
  const [jams, setJams] = useState<Jam[]>([])
  const [user, setUser] = useState<Profile>({
    id: "",
    name: "",
    username: "",
    bio: "",
    avatar: "",
    followers: 0,
    following: 0,
    totalJams: 0,
    totalLikes: 0,
    isFollowing: false,
  })
  const router = useRouter()

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
        totalLikes: data.totalUserLikes,
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
  }, [setJams])

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
    console.log("Fetched jams:", jams)
    // console.log("Fetched jams:", jams._count.streams)
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
      totalSongs: jam._count.streams , // Use _count.songs if available
      totalLikes: jam.likesCount,
      }
    })
    setJams(newJam)
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

  const handleJoinJam = async (jamId: string) => {
    if (!jamId.trim()) return

    setIsJoining(true)

    console.log("Joining jam with ID:", jamId)

    setIsJoining(false)
    setJamId("")
    setIsJoinDialogOpen(false)

    // Redirect to the jam page
    router.push(`/creator/${jamId}`)
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
      <Redirect />
      <DashboardHeader
        jamName={jamName}
        setJamName={setJamName}
        jamGenre={jamGenre}
        setJamGenre={setJamGenre}
        jamId={jamId}
        setJamId={setJamId}
        isCreating={isCreating}
        isJoining={isJoining}
        isCreateDialogOpen={isCreateDialogOpen}
        setIsCreateDialogOpen={setIsCreateDialogOpen}
        isJoinDialogOpen={isJoinDialogOpen}
        setIsJoinDialogOpen={setIsJoinDialogOpen}
        handleCreateJam={handleCreateJam}
        handleJoinJam={handleJoinJam}
        genres={genres}
      />

      <div className="container mx-auto px-4 lg:px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            <UserProfile
              user={user}
              jamCount={jams.length}
              onFollowUser={handleFollowUser}
              onShareProfile={handleShareProfile}
            />

            <JamsList
              jams={jams}
              onEnterJam={enterJam}
              onDeleteJam={handleDeleteJam}
              onCreateNewJam={() => setIsCreateDialogOpen(true)}
              getGenreColor={getGenreColor}
            />
          </div>

          {/* Sidebar */}
          <DashboardSidebar />
        </div>
      </div>
    </div>
  )
}
