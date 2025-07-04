"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FaMusic, FaYoutube, FaCheck, FaTimes, FaPlus } from "react-icons/fa"
import { extractYouTubeId } from "@/app/lib/utils/url-extractors"
import { detectPlatform } from "@/app/lib/utils/platform-detection"
import { formatDuration } from "@/app/lib/utils/format-utils"
import { fetchYouTubeVideoPreview, submitStream } from "@/app/lib/utils/api-utils"
import { MusicPreview } from "@/app/lib/types/jam-types"
import { useParams } from "next/navigation"

interface AddMusicFormProps {
  jamId: string
  onSongAdded: () => Promise<void> | void // Support both sync and async
}

// Error handling utility
const handleError = (error: unknown, context: string): string => {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
  console.error(`${context}:`, errorMessage);
  return errorMessage;
};

export function AddMusicForm({ jamId, onSongAdded }: AddMusicFormProps) {
  const [musicUrl, setMusicUrl] = useState("")
  const [musicPreview, setMusicPreview] = useState<MusicPreview | null>(null)
  const [isValidUrl, setIsValidUrl] = useState<boolean | null>(null)
  const [detectedPlatform, setDetectedPlatform] = useState<"youtube" | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const params = useParams();

  useEffect(() => {
    let isMounted = true;
    
    const validateAndFetchPreview = async () => {
      if (!musicUrl) {
        setIsValidUrl(null)
        setDetectedPlatform(null)
        setMusicPreview(null)
        setError(null)
        return;
      }

      const platform = detectPlatform(musicUrl)
      
      if (platform === "youtube") {
        setDetectedPlatform("youtube")
        const videoId = extractYouTubeId(musicUrl)
        
        if (videoId) {
          setIsValidUrl(true)
          setIsLoading(true)
          setError(null)
          
          try {
            const videoData = await fetchYouTubeVideoPreview(musicUrl);
            
            if (isMounted) {
              setMusicPreview({
                jamId,
                platform: "youtube",
                videoId,
                title: videoData.title,
                artist: videoData.artist,
                duration: formatDuration(videoData.duration),
                thumbnail: videoData.bigImg,
                url: musicUrl,
              })
              setIsLoading(false)
            }
          } catch (error) {
            if (isMounted) {
              const errorMessage = handleError(error, 'Failed to fetch YouTube video details');
              setIsValidUrl(false)
              setMusicPreview(null)
              setIsLoading(false)
              setError('Failed to fetch video details. Please check the URL and try again.')
            }
          }
        } else {
          setIsValidUrl(false)
          setMusicPreview(null)
        }
      } else {
        setIsValidUrl(false)
        setDetectedPlatform(null)
        setMusicPreview(null)
      }
    };

    validateAndFetchPreview();

    return () => {
      isMounted = false;
    };
  }, [musicUrl, jamId])

  const resetForm = () => {
    setMusicUrl("")
    setMusicPreview(null)
    setIsValidUrl(null)
    setDetectedPlatform(null)
    setError(null)
  };

  const handleAutoUpvote = async (streamId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/streams/upvote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          streamId: streamId
        }),
      });

      if (!response.ok) {
        throw new Error(`Auto-upvote failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      // Log but don't throw - auto-upvote is not critical
      handleError(error, 'Auto-upvote failed');
    }
  };

  const handleSubmitMusic = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!musicPreview) return

  setIsSubmitting(true)

  try {
    console.log("📤 Submitting music...");
    
    // Submit the stream
    const responseData = await submitStream(jamId, musicUrl);
    
    // 🔥 FIX: Access stream ID from nested structure
    const streamId = responseData?.stream?.id;  // ✅ Fixed: stream.id instead of id

    if (!streamId) {
      console.error('Response structure:', responseData);
      throw new Error('No stream ID returned from API');
    }

    // Wait for auto-upvote to complete BEFORE refreshing the UI
    try {
      await handleAutoUpvote(streamId);
      console.log("✅ Auto-upvote completed");
    } catch (upvoteError) {
      // Log but don't fail the entire submission
      handleError(upvoteError, 'Auto-upvote failed');
    }

    // Reset form state
    resetForm();
    
    // Refresh the song list AFTER upvote is done
      setTimeout(async () => {
        try {
          await Promise.resolve(onSongAdded());
          console.log("✅ Song list refreshed");
        } catch (refreshError) {
          console.error("❌ Failed to refresh song list:", refreshError);
        }
      }, 1000);
    
  } catch (error) {
    const errorMessage = handleError(error, 'Failed to submit music');
    setError(`Failed to submit music: ${errorMessage}`);
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
                placeholder="Paste YouTube URL here..."
                value={musicUrl}
                onChange={(e) => setMusicUrl(e.target.value)}
                className={`border-gray-300 focus:border-black ${isValidUrl === false ? "border-red-300 focus:border-red-500" : ""}`}
                disabled={isSubmitting}
              />
              {detectedPlatform && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <FaYoutube className="w-4 h-4 text-red-500" />
                  <span>YouTube URL detected</span>
                </div>
              )}
              {isValidUrl === false && (
                <Alert className="border-red-200 bg-red-50">
                  <FaTimes className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-red-700">
                    Please enter a valid YouTube URL
                  </AlertDescription>
                </Alert>
              )}
              {isValidUrl === true && (
                <Alert className="border-green-200 bg-green-50">
                  <FaCheck className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-700">
                    Valid YouTube URL detected
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

            {isLoading && (
              <div className="flex items-center justify-center p-4">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin mr-2" />
                <span className="text-sm text-gray-600">Loading preview...</span>
              </div>
            )}

            {musicPreview && (
              <div className="space-y-3">
                <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <h4 className="font-medium text-black mb-2 flex items-center space-x-2">
                    <FaYoutube className="w-4 h-4 text-red-500" />
                    <span>Preview</span>
                  </h4>
                  <div className="flex items-center space-x-3">
                    <img
                      src={musicPreview.thumbnail}
                      alt={musicPreview.title}
                      className="w-16 h-12 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-black truncate">{musicPreview.title}</p>
                      <p className="text-xs text-gray-600 truncate">{musicPreview.artist}</p>
                      <p className="text-xs text-gray-500">{musicPreview.duration}</p>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleSubmitMusic}
                  disabled={isSubmitting || isLoading}
                  className="w-full bg-black hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
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