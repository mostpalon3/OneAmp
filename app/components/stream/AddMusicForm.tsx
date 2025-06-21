"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FaMusic, FaSpotify, FaYoutube, FaCheck, FaTimes, FaPlus } from "react-icons/fa"
import { extractYouTubeId, extractSpotifyId } from "@/app/lib/utils/url-extractors"
import { detectPlatform } from "@/app/lib/utils/platform-detection"
import { formatDuration } from "@/app/lib/utils/format-utils"
import { fetchYouTubeVideoPreview, submitStream } from "@/app/lib/utils/api-utils"
import { MusicPreview } from "@/app/lib/types/stream-types"
import { on } from "events"

interface AddMusicFormProps {
  creatorId: string
  onSongAdded: () => void
  // onEmptyQueue: () => void
}

export function AddMusicForm({ creatorId, onSongAdded }: AddMusicFormProps) {
  const [musicUrl, setMusicUrl] = useState("")
  const [musicPreview, setMusicPreview] = useState<MusicPreview | null>(null)
  const [isValidUrl, setIsValidUrl] = useState<boolean | null>(null)
  const [detectedPlatform, setDetectedPlatform] = useState<"youtube" | "spotify" | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (musicUrl) {
      const platform = detectPlatform(musicUrl)
      setDetectedPlatform(platform)

      if (platform === "youtube") {
        const videoId = extractYouTubeId(musicUrl)
        if (videoId) {
          setIsValidUrl(true)
          setIsLoading(true)
          setError(null)
          
          fetchYouTubeVideoPreview(musicUrl)
            .then((videoData) => {
              setMusicPreview({
                creatorId,
                platform: "youtube",
                videoId,
                title: videoData.title,
                artist: videoData.artist,
                duration: formatDuration(videoData.duration),
                thumbnail: videoData.bigImg,
                url: musicUrl,
              })
              setIsLoading(false)
            })
            .catch((error) => {
              console.error('Error fetching YouTube video details:', error)
              setIsValidUrl(false)
              setMusicPreview(null)
              setIsLoading(false)
              setError('Failed to fetch video details. Please check the URL and try again.')
            })
        } else {
          setIsValidUrl(false)
          setMusicPreview(null)
        }
      } else if (platform === "spotify") {
        const trackId = extractSpotifyId(musicUrl)
        if (trackId) {
          setIsValidUrl(true)
          setMusicPreview({
            platform: "spotify",
            spotifyId: trackId,
            title: "Spotify Track Preview",
            artist: "Track details will be available after submission",
            duration: "Unknown",
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
      setError(null)
    }
  }, [musicUrl, creatorId])

  const handleSubmitMusic = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!musicPreview) return

    setIsSubmitting(true)

    try {
      console.log("📤 Submitting music...");
      const responseData = await submitStream(creatorId, musicUrl);
      const streamId = responseData.id;

      if (!streamId) {
        throw new Error('No stream ID returned from API');
      }

      try {
        await fetch(`/api/streams/upvote`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            streamId: streamId
          }),
        });
      } catch (voteError) {
        console.error('Auto-upvote failed:', voteError);
      }

      console.log("✅ Music submitted successfully");
      setMusicUrl("")
      setMusicPreview(null)
      setIsValidUrl(null)
      setDetectedPlatform(null)
      setError(null)
      
      // Wait a moment before refreshing to ensure database is updated
      setTimeout(() => {
        onSongAdded()
      }, 500);
      
    } catch (error) {
      console.error('Error submitting music:', error)
      setError('Failed to submit music. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
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
                className={`border-gray-300 focus:border-black ${isValidUrl === false ? "border-red-300 focus:border-red-500" : ""}`}
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
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <FaTimes className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-red-700">
                    {error}
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
                  {musicPreview.platform === "spotify" && musicPreview.spotifyId && (
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
                  disabled={isSubmitting || isLoading}
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
  )
}