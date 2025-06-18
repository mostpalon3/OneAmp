"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import {
  FaSpotify,
  FaYoutube,
  FaArrowUp,
  FaArrowDown,
  FaUsers,
  FaClock,
  FaPlus,
  FaHeart,
  FaShare,
  FaEye,
  FaCheck,
  FaTimes,
  FaMusic,
} from "react-icons/fa"
import { BiMusic, BiTrendingUp } from "react-icons/bi"
import { HiOutlineSparkles, HiOutlineFire } from "react-icons/hi"
import axios from "axios"
import { set } from "zod"

const REFRESH_INTERVAL_MS = 10 * 1000 // 10 seconds
// Mock data for current playing song
const currentSong = {
  id: 1,
  title: "Blinding Lights",
  artist: "The Weeknd",
  duration: "3:20",
  currentTime: "1:45",
  platform: "spotify",
  albumArt: "/placeholder.svg?height=300&width=300",
  votes: 234,
  spotifyId: "0VjIjW4GlUZAMYd2vXMi3b", // Example Spotify track ID
}

// Mock data for YouTube current video
const currentVideo = {
  id: 1,
  title: "Dua Lipa - Levitating (Official Music Video)",
  artist: "Dua Lipa",
  duration: "3:23",
  currentTime: "1:12",
  platform: "youtube",
  videoId: "TUVcZfQe-Kw", // Example YouTube video ID
  thumbnail: "https://img.youtube.com/vi/TUVcZfQe-Kw/maxresdefault.jpg",
  votes: 189,
}

// Mock queue data
const initialQueue = [
  {
    id: 2,
    title: "Watermelon Sugar",
    artist: "Harry Styles",
    duration: "2:54",
    platform: "youtube",
    videoId: "E07s5ZYygMg",
    thumbnail: "https://img.youtube.com/vi/E07s5ZYygMg/maxresdefault.jpg",
    votes: 189,
    userVoted: "up",
    submittedBy: "user123",
  },
  {
    id: 3,
    title: "Good 4 U",
    artist: "Olivia Rodrigo",
    duration: "2:58",
    platform: "youtube",
    videoId: "gNi_6U5Pm_o",
    thumbnail: "https://img.youtube.com/vi/gNi_6U5Pm_o/maxresdefault.jpg",
    votes: 156,
    userVoted: null,
    submittedBy: "musiclover",
  },
  {
    id: 4,
    title: "Anti-Hero",
    artist: "Taylor Swift",
    duration: "3:20",
    platform: "spotify",
    spotifyId: "0V3wPSX9ygBnCm8psDIegu",
    albumArt: "/placeholder.svg?height=60&width=60",
    votes: 142,
    userVoted: "down",
    submittedBy: "swiftie",
  },
  {
    id: 5,
    title: "Stay",
    artist: "The Kid LAROI & Justin Bieber",
    duration: "2:21",
    platform: "youtube",
    videoId: "kTJczUoc26U",
    thumbnail: "https://img.youtube.com/vi/kTJczUoc26U/maxresdefault.jpg",
    votes: 98,
    userVoted: null,
    submittedBy: "popfan",
  },
  {
    id: 6,
    title: "Flowers",
    artist: "Miley Cyrus",
    duration: "3:20",
    platform: "spotify",
    spotifyId: "0yLdNVWF3Srea0uzk55zFn",
    albumArt: "/placeholder.svg?height=60&width=60",
    votes: 87,
    userVoted: null,
    submittedBy: "musicfan",
  },
]

// Function to extract YouTube video ID from URL
const extractYouTubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

// Function to extract Spotify track ID from URL
const extractSpotifyId = (url: string): string | null => {
  const regExp = /^https?:\/\/(?:open\.)?spotify\.com\/track\/([a-zA-Z0-9]+)(\?.*)?$/
  const match = url.match(regExp)
  return match ? match[1] : null
}

// Function to detect platform from URL
const detectPlatform = (url: string): "youtube" | "spotify" | null => {
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    return "youtube"
  }
  if (url.includes("spotify.com")) {
    return "spotify"
  }
  return null
}

// Function to get YouTube video info (mock)
const getYouTubeVideoInfo = async (videoId: string) => {
  // In a real app, you'd call YouTube API here
  return {
    title: "Sample YouTube Video",
    artist: "Sample Artist",
    duration: "3:45",
    thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
  }
}

// Function to get Spotify track info (mock)
const getSpotifyTrackInfo = async (trackId: string) => {
  // In a real app, you'd call Spotify API here
  return {
    title: "Sample Spotify Track",
    artist: "Sample Artist",
    duration: "3:20",
    albumArt: "/placeholder.svg?height=300&width=300",
  }
}

export default function Dashboard() {
  const [musicUrl, setMusicUrl] = useState("")
  const [musicPreview, setMusicPreview] = useState<any>(null)
  const [queue, setQueue] = useState(initialQueue)
  const [isValidUrl, setIsValidUrl] = useState<boolean | null>(null)
  const [detectedPlatform, setDetectedPlatform] = useState<"youtube" | "spotify" | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentPlaying, setCurrentPlaying] = useState<"spotify" | "youtube">("youtube")

  async function refreshStreams() {
    try {
      const res = await fetch("/api/streams/my");
      
      if (!res.ok) {
        console.warn("Failed to fetch streams:", res.status);
        return null;
      }
      
      const data = await res.json();
      console.log("Streams refreshed:", data);
      return data;
    } catch (error) {
      console.error("Error refreshing streams:", error);
      return null;
    }
  }

  useEffect(() => {
    const fetchInitialStreams = async () => {
      const streams = await refreshStreams();
      console.log("Initial streams fetched:", streams.streams);
      console.log(streams.streams[0].type)
      if (streams) {
        // Transform the API data to match your queue structure
        const transformedStreams = streams.streams.map((stream: any) => ({
          id: stream.id,
          title: stream.title || "Unknown Title",
          artist: stream.artist || "Unknown Artist", 
          duration: stream.duration || "0:00",
          platform: stream.type.toLowerCase(), // "YouTube" -> "youtube"
          videoId: stream.extractedId,
          thumbnail: stream.smallImg,
          votes: stream._count.upvotes || 0,
          userVoted: stream.hasUserVoted || null,
          submittedBy: stream.submittedBy || "anonymous"
        }));
        
        setQueue(transformedStreams);
      }
    };
    
    fetchInitialStreams();
    
    const interval = setInterval(() => {
      // refreshStreams();
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);
  console.log("Queue initialized:", queue)

  // Handle music URL input
  useEffect(() => {
    if (musicUrl) {
      const platform = detectPlatform(musicUrl)
      setDetectedPlatform(platform)

      if (platform === "youtube") {
        const videoId = extractYouTubeId(musicUrl)
        if (videoId) {
          setIsValidUrl(true)
          // Mock video info - in real app, fetch from YouTube API
          setMusicPreview({
            platform: "youtube",
            videoId,
            title: "Sample YouTube Video",
            artist: "Sample Artist",
            duration: "3:45",
            thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          })
        } else {
          setIsValidUrl(false)
          setMusicPreview(null)
        }
      } else if (platform === "spotify") {
        const trackId = extractSpotifyId(musicUrl)
        if (trackId) {
          setIsValidUrl(true)
          // Mock track info - in real app, fetch from Spotify API
          setMusicPreview({
            platform: "spotify",
            spotifyId: trackId,
            title: "Sample Spotify Track",
            artist: "Sample Artist",
            duration: "3:20",
            albumArt: "/placeholder.svg?height=300&width=300",
          })
        } else {
          setIsValidUrl(false)
          setMusicPreview(null)
        }
      } else {
        setIsValidUrl(false)
        setMusicPreview(null)
      }
    } else {
      setIsValidUrl(null)
      setDetectedPlatform(null)
      setMusicPreview(null)
    }
  }, [musicUrl])

  const handleVote = (songId: number, isUpvote: boolean) => {
    fetch(`/api/streams/upvote/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        streamId: songId
      }),
    })
    setQueue(
      (prevQueue) =>
        prevQueue
          .map((song) => {
            if (song.id === songId) {
              let newVotes = song.votes
              let newUserVoted = song.userVoted

              if (song.userVoted === (isUpvote ? "up" : "down")) {
                // Remove vote
                newVotes = isUpvote ? newVotes - 1 : newVotes + 1
                newUserVoted = null
              } else if (song.userVoted === null) {
                // Add vote
                newVotes = isUpvote ? newVotes + 1 : newVotes - 1
                newUserVoted = isUpvote ? "up" : "down"
              } else {
                // Change vote
                newVotes = isUpvote ? newVotes + 2 : newVotes - 2
                newUserVoted = isUpvote ? "up" : "down"
              }

              return { ...song, votes: newVotes, userVoted: newUserVoted }
            }
            return song
          })
          .sort((a, b) => b.votes - a.votes), // Sort by votes descending
    )
  }

  const handleSubmitMusic = async () => {
    if (!musicPreview) return

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newSong = {
      id: Date.now(),
      title: musicPreview.title,
      artist: musicPreview.artist,
      duration: musicPreview.duration,
      platform: musicPreview.platform,
      ...(musicPreview.platform === "youtube"
        ? {
          videoId: musicPreview.videoId,
          thumbnail: musicPreview.thumbnail,
        }
        : {
          spotifyId: musicPreview.spotifyId,
          albumArt: musicPreview.albumArt,
        }),
      votes: 1, // Start with 1 vote from submitter
      userVoted: "up" as const,
      submittedBy: "currentUser",
    }

    setQueue((prevQueue) => [...prevQueue, newSong].sort((a, b) => b.votes - a.votes))
    setMusicUrl("")
    setMusicPreview(null)
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
            <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Live</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-600">
              <FaUsers className="w-4 h-4" />
              <span className="text-sm">1,247</span>
            </div>
            <Button variant="ghost" size="sm">
              <FaShare className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 lg:px-6 py-6">
        {/* Stream Info */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">DJ</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-black">DJ MixMaster's Stream</h1>
              <p className="text-gray-600">Electronic • House • Progressive</p>
            </div>
          </div>
          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <FaEye className="w-4 h-4" />
              <span>1,247 viewers</span>
            </div>
            <div className="flex items-center space-x-1">
              <FaClock className="w-4 h-4" />
              <span>2h 34m streaming</span>
            </div>
            <div className="flex items-center space-x-1">
              <BiTrendingUp className="w-4 h-4" />
              <span>+15% engagement</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Now Playing */}
            <Card className="border-gray-200">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <HiOutlineFire className="w-5 h-5 text-red-500" />
                    <span>Now Playing</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant={currentPlaying === "spotify" ? "default" : "outline"}
                      onClick={() => setCurrentPlaying("spotify")}
                      className="h-8"
                    >
                      <FaSpotify className="w-4 h-4 mr-1" />
                      Spotify
                    </Button>
                    <Button
                      size="sm"
                      variant={currentPlaying === "youtube" ? "default" : "outline"}
                      onClick={() => setCurrentPlaying("youtube")}
                      className="h-8"
                    >
                      <FaYoutube className="w-4 h-4 mr-1" />
                      YouTube
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {currentPlaying === "spotify" ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={currentSong.albumArt || "/placeholder.svg"}
                        alt={currentSong.title}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-black mb-1">{currentSong.title}</h3>
                        <p className="text-gray-600 mb-2">{currentSong.artist}</p>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <FaSpotify className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-500">Spotify</span>
                          </div>
                          <div className="flex items-center space-x-1 text-gray-500">
                            <FaHeart className="w-4 h-4" />
                            <span className="text-sm">{currentSong.votes}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500 mb-1">
                          {currentSong.currentTime} / {currentSong.duration}
                        </div>
                        <div className="w-24 h-1 bg-gray-200 rounded-full">
                          <div className="w-1/2 h-1 bg-green-500 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    {/* Spotify Embed */}
                    <div className="w-full">
                      <iframe
                        src={`https://open.spotify.com/embed/track/${currentSong.spotifyId}?utm_source=generator&theme=0`}
                        width="100%"
                        height="152"
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        className="rounded-lg"
                      ></iframe>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={currentVideo.thumbnail || "/placeholder.svg"}
                        alt={currentVideo.title}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-black mb-1">{currentVideo.title}</h3>
                        <p className="text-gray-600 mb-2">{currentVideo.artist}</p>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <FaYoutube className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-gray-500">YouTube</span>
                          </div>
                          <div className="flex items-center space-x-1 text-gray-500">
                            <FaHeart className="w-4 h-4" />
                            <span className="text-sm">{currentVideo.votes}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500 mb-1">
                          {currentVideo.currentTime} / {currentVideo.duration}
                        </div>
                        <div className="w-24 h-1 bg-gray-200 rounded-full">
                          <div className="w-1/3 h-1 bg-red-500 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    {/* YouTube Embed */}
                    <div className="aspect-video w-full">
                      <iframe
                        src={`https://www.youtube.com/embed/${currentVideo.videoId}?autoplay=1&mute=1`}
                        title={currentVideo.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full rounded-lg"
                      ></iframe>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Queue */}
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
                  <div
                    key={song.id}
                    className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-400 w-6 text-center">{index + 1}</span>
                      <img
                        src={song.platform === "youtube" ? song.thumbnail : song.albumArt || "/placeholder.svg"}
                        alt={song.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <h4 className="font-medium text-black">{song.title}</h4>
                      <p className="text-sm text-gray-600">{song.artist}</p>
                      <div className="flex items-center space-x-3 mt-1">
                        <div className="flex items-center space-x-1">
                          {song.platform === "spotify" ? (
                            <FaSpotify className="w-3 h-3 text-green-500" />
                          ) : (
                            <FaYoutube className="w-3 h-3 text-red-500" />
                          )}
                          <span className="text-xs text-gray-500">{song.duration}</span>
                        </div>
                        <span className="text-xs text-gray-400">by @{song.submittedBy}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <Button
                          size="sm"
                          variant={song.userVoted === "up" ? "default" : "outline"}
                          className={`h-8 w-8 p-0 ${song.userVoted === "up"
                              ? "bg-green-600 hover:bg-green-700"
                              : "hover:bg-green-50 hover:border-green-300"
                            }`}
                          onClick={() => handleVote(song.id, true)}
                        >
                          <FaArrowUp
                            className={`w-3 h-3 ${song.userVoted === "up" ? "text-white" : "text-green-600"}`}
                          />
                        </Button>
                        <span className="text-sm font-medium text-gray-700 min-w-[2rem] text-center">{song.votes}</span>
                        <Button
                          size="sm"
                          variant={song.userVoted === "down" ? "default" : "outline"}
                          className={`h-8 w-8 p-0 ${song.userVoted === "down"
                              ? "bg-red-600 hover:bg-red-700"
                              : "hover:bg-red-50 hover:border-red-300"
                            }`}
                          onClick={() => handleVote(song.id, false)}
                        >
                          <FaArrowDown
                            className={`w-3 h-3 ${song.userVoted === "down" ? "text-white" : "text-red-600"}`}
                          />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Add Music */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FaMusic className="w-4 h-4" />
                  <span>Add Music</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="url" className="w-full">
                  <TabsList className="grid w-full grid-cols-1 bg-gray-100 mb-4">
                    <TabsTrigger value="url" className="text-sm">
                      Add by URL
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="url" className="space-y-4">
                    <div className="space-y-2">
                      <Input
                        placeholder="Paste YouTube or Spotify URL here..."
                        value={musicUrl}
                        onChange={(e) => setMusicUrl(e.target.value)}
                        className={`border-gray-300 focus:border-black ${isValidUrl === false ? "border-red-300 focus:border-red-500" : ""
                          }`}
                      />
                      {detectedPlatform && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          {detectedPlatform === "youtube" ? (
                            <FaYoutube className="w-4 h-4 text-red-500" />
                          ) : (
                            <FaSpotify className="w-4 h-4 text-green-500" />
                          )}
                          <span>{detectedPlatform === "youtube" ? "YouTube" : "Spotify"} URL detected</span>
                        </div>
                      )}
                      {isValidUrl === false && (
                        <Alert className="border-red-200 bg-red-50">
                          <FaTimes className="h-4 w-4 text-red-500" />
                          <AlertDescription className="text-red-700">
                            Please enter a valid YouTube or Spotify URL
                          </AlertDescription>
                        </Alert>
                      )}
                      {isValidUrl === true && (
                        <Alert className="border-green-200 bg-green-50">
                          <FaCheck className="h-4 w-4 text-green-500" />
                          <AlertDescription className="text-green-700">
                            Valid {detectedPlatform === "youtube" ? "YouTube" : "Spotify"} URL detected
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    {musicPreview && (
                      <div className="space-y-3">
                        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                          <h4 className="font-medium text-black mb-2 flex items-center space-x-2">
                            {musicPreview.platform === "youtube" ? (
                              <FaYoutube className="w-4 h-4 text-red-500" />
                            ) : (
                              <FaSpotify className="w-4 h-4 text-green-500" />
                            )}
                            <span>Preview</span>
                          </h4>
                          <div className="flex items-center space-x-3">
                            <img
                              src={
                                musicPreview.platform === "youtube"
                                  ? musicPreview.thumbnail
                                  : musicPreview.albumArt || "/placeholder.svg"
                              }
                              alt={musicPreview.title}
                              className="w-16 h-12 rounded object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-black truncate">{musicPreview.title}</p>
                              <p className="text-xs text-gray-600 truncate">{musicPreview.artist}</p>
                              <p className="text-xs text-gray-500">{musicPreview.duration}</p>
                            </div>
                          </div>
                          {musicPreview.platform === "spotify" && (
                            <div className="mt-3">
                              <iframe
                                src={`https://open.spotify.com/embed/track/${musicPreview.spotifyId}?utm_source=generator&theme=0`}
                                width="100%"
                                height="80"
                                frameBorder="0"
                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                loading="lazy"
                                className="rounded"
                              ></iframe>
                            </div>
                          )}
                        </div>
                        <Button
                          onClick={handleSubmitMusic}
                          disabled={isSubmitting}
                          className="w-full bg-black hover:bg-gray-800"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              Adding...
                            </>
                          ) : (
                            <>
                              <FaPlus className="w-4 h-4 mr-2" />
                              Add to Queue
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Stream Stats */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <HiOutlineSparkles className="w-4 h-4" />
                  <span>Stream Stats</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Votes</span>
                  <span className="font-semibold text-black">{queue.reduce((sum, song) => sum + song.votes, 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Songs in Queue</span>
                  <span className="font-semibold text-black">{queue.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">YouTube Videos</span>
                  <span className="font-semibold text-black">
                    {queue.filter((song) => song.platform === "youtube").length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Spotify Tracks</span>
                  <span className="font-semibold text-black">
                    {queue.filter((song) => song.platform === "spotify").length}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FaHeart className="w-4 h-4 mr-2" />
                  Follow Stream
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FaShare className="w-4 h-4 mr-2" />
                  Share Stream
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
