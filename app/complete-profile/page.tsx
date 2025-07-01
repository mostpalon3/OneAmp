"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { FaUpload, FaCheck, FaArrowRight } from "react-icons/fa"
import { BiMusic } from "react-icons/bi"

// Genre options
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

// Enhanced file validation function
const validateFile = (file: File): string | null => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!allowedTypes.includes(file.type)) {
    return "Please select a valid image file (JPEG, PNG, GIF, or WebP)";
  }
  
  if (file.size > maxSize) {
    return "File size must be less than 5MB";
  }
  
  return null;
};

export default function CompleteProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isCompleting, setIsCompleting] = useState(false)
  const [isCheckingProfile, setIsCheckingProfile] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    favoriteGenre: "",
    profilePicture: "",
  })

  // Check if user is authenticated and if profile is already complete
  useEffect(() => {
    if (status === "loading") return

    if (!session?.user) {
      // Not authenticated, redirect to auth page
      router.push("/auth")
      return
    }

    // Check if profile is already complete
    checkProfileCompletion()
    
    // Set initial form data from session
    setFormData({
      name: session.user.name || "",
      username: "",
      favoriteGenre: "",
      profilePicture: session.user.image || "",
    })
  }, [session, status, router])

  const checkProfileCompletion = async () => {
    if (!session?.user) return

    setIsCheckingProfile(true)
    try {
      const response = await fetch("/api/complete-profile", {
        method: "GET"
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.profile?.profileCompleted) {
          // Profile is already complete, redirect to dashboard
          router.push(`/dashboards/${session.user.id}`)
        }
      }
      // If profile is not complete or not found, stay on this page
    } catch (error) {
      console.error("Error checking profile completion:", error)
    } finally {
      setIsCheckingProfile(false)
    }
  }

  const handleCompleteProfile = async () => {
    if (!formData.name.trim() || !formData.username.trim() || !formData.favoriteGenre) {
      setError("Please fill in all required fields")
      return
    }

    setIsCompleting(true)
    setError(null)

    try {
      const response = await fetch("/api/complete-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          favoriteGenre: formData.favoriteGenre,
          profilePicture: formData.profilePicture,
        }),
      })

      if (response.ok) {
        // Profile completed successfully, redirect to dashboard
        router.push(`/dashboards/${session?.user?.id}`)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to complete profile")
      }
    } catch (error) {
      console.error("Profile completion error:", error)
      setError("An unexpected error occurred")
    } finally {
      setIsCompleting(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Use the enhanced validation function
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Clear any previous errors
    setError(null);

    // Process the valid file
    const reader = new FileReader();
    
    reader.onload = (e) => {
      setFormData((prev) => ({
        ...prev,
        profilePicture: e.target?.result as string,
      }));
    };
    
    reader.onerror = () => {
      setError("Failed to read file");
    };
    
    reader.readAsDataURL(file);
  }

  const generateUsername = () => {
    const name = formData.name.toLowerCase().replace(/\s+/g, "").replace(/[^a-zA-Z0-9]/g, "")
    const randomNum = Math.floor(Math.random() * 1000)
    const generatedUsername = `${name}${randomNum}`
    setFormData((prev) => ({
      ...prev,
      username: generatedUsername,
    }))
  }

  const handleUsernameChange = (value: string) => {
    // Only allow alphanumeric characters and underscores
    const cleanedValue = value.replace(/[^a-zA-Z0-9_]/g, "")
    setFormData((prev) => ({ ...prev, username: cleanedValue }))
    
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (error) setError(null)
  }

  // Show loading state while checking authentication or profile
  if (status === "loading" || isCheckingProfile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, show loading (redirect will happen)
  if (!session?.user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Redirecting to sign in...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <BiMusic className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-medium text-black">OneAmp</span>
          </Link>
          <h1 className="text-2xl font-medium text-black mb-2">Complete your profile</h1>
          <p className="text-gray-600">Tell us a bit about yourself to get started</p>
        </div>

        {/* Profile Setup Card */}
        <Card className="border border-gray-200">
          <CardContent className="p-8">
            {/* Google Account Info */}
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg mb-6">
              <Avatar className="w-10 h-10">
                <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                <AvatarFallback className="bg-gray-200 text-gray-600">
                  {session.user.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="text-sm font-medium text-black">{session.user.email}</div>
                <div className="text-xs text-gray-500">Connected via Google</div>
              </div>
              <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                <FaCheck className="w-2 h-2 text-green-600" />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Profile Picture */}
              <div className="text-center">
                <div className="relative inline-block">
                  <Avatar className="w-20 h-20 mx-auto">
                    <AvatarImage src={formData.profilePicture || ""} alt="Profile" />
                    <AvatarFallback className="bg-gray-100 text-gray-600 text-xl">
                      {formData.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("") || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-black rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors">
                    <FaUpload className="w-3 h-3 text-white" />
                    <input 
                      type="file" 
                      accept="image/jpeg,image/png,image/gif,image/webp" 
                      onChange={handleFileUpload} 
                      className="hidden" 
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">Click to upload profile picture</p>
                <p className="text-xs text-gray-400 mt-1">Supports JPEG, PNG, GIF, WebP (max 5MB)</p>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm text-gray-700">
                  Display Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Enter your display name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="border-gray-200 focus:border-black"
                />
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm text-gray-700">
                  Username <span className="text-red-500">*</span>
                </Label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">@</span>
                    <Input
                      id="username"
                      placeholder="username"
                      value={formData.username}
                      onChange={(e) => handleUsernameChange(e.target.value)}
                      className="border-gray-200 focus:border-black pl-8"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateUsername}
                    disabled={!formData.name.trim()}
                    className="border-gray-200 text-gray-600 hover:bg-gray-50 px-3"
                  >
                    Generate
                  </Button>
                </div>
                <p className="text-xs text-gray-500">This will be your unique identifier on OneAmp</p>
              </div>

              {/* Favorite Genre */}
              <div className="space-y-2">
                <Label htmlFor="genre" className="text-sm text-gray-700">
                  Favorite Genre <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.favoriteGenre}
                  onValueChange={(value) => handleInputChange("favoriteGenre", value)}
                >
                  <SelectTrigger className="border-gray-200 focus:border-black">
                    <SelectValue placeholder="Select your favorite music genre" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    {genres.map((genre) => (
                      <SelectItem key={genre} value={genre}>
                        {genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">This helps us personalize your experience</p>
              </div>

              {/* Complete Button */}
              <Button
                onClick={handleCompleteProfile}
                disabled={!formData.name.trim() || !formData.username.trim() || !formData.favoriteGenre || isCompleting}
                className="w-full bg-black text-white hover:bg-gray-800"
              >
                {isCompleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Setting up your profile...
                  </>
                ) : (
                  <>
                    Complete Setup
                    <FaArrowRight className="w-3 h-3 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Back to Sign In */}
        <div className="mt-6 text-center">
          <Link
            href="/auth"
            className="text-sm text-gray-500 hover:text-black transition-colors"
          >
            ← Back to sign in
          </Link>
          </div>
      </div>
    </div>
  )
}