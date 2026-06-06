"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FaSpotify, FaCheck, FaArrowLeft, FaCamera, FaMicrophone } from "react-icons/fa"
import { BiMusic } from "react-icons/bi"
import Link2 from "next/link"

const genres = [
  "Electronic", "Hip-Hop", "Pop", "Rock", "Jazz", "Classical", "R&B",
  "Country", "Reggae", "Blues", "Folk", "Indie", "Dance", "House",
  "Techno", "Ambient", "Chill", "Acoustic", "Mixed",
]

export default function EditProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name: "",
    username: "",
    bio: "",
    favoriteGenre: "",
    favoriteSinger: "",
    spotifyUrl: "",
    image: "",
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth")
  }, [status, router])

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile")
        if (res.ok) {
          const data = await res.json()
          const p = data.profile
          setForm({
            name: p.user?.name || "",
            username: p.username || "",
            bio: p.bio || "",
            favoriteGenre: p.favoriteGenre || "",
            favoriteSinger: p.favoriteSinger || "",
            spotifyUrl: p.spotifyUrl || "",
            image: p.image || p.user?.image || "",
          })
        }
      } catch {}
      finally { setIsLoading(false) }
    }
    if (session) fetchProfile()
  }, [session])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError("Image must be under 5MB"); return }
    const reader = new FileReader()
    reader.onload = (ev) => {
      setForm(p => ({ ...p, image: ev.target?.result as string }))
      setError(null)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "Failed to save"); return }
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading || status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 h-14 flex items-center gap-3">
        <Link href={`/dashboards/${session?.user?.id}`} className="text-gray-400 hover:text-gray-700 transition-colors">
          <FaArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-black rounded-md flex items-center justify-center">
            <BiMusic className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-gray-900">Edit Profile</span>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Avatar section */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-700 px-6 pt-8 pb-6 flex flex-col items-center">
            <div className="relative">
              <Avatar className="w-24 h-24 ring-4 ring-white">
                <AvatarImage src={form.image} />
                <AvatarFallback className="bg-gray-600 text-white text-2xl">
                  {form.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 transition-colors"
              >
                <FaCamera className="w-3.5 h-3.5 text-gray-700" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            <p className="text-white/60 text-xs mt-3">Click camera to change photo</p>
          </div>

          <div className="p-6 space-y-5">
            {/* Name */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Display Name</Label>
              <Input
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Your name"
                className="border-gray-200 focus:border-gray-400 focus:ring-0"
              />
            </div>

            {/* Username */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Username</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                <Input
                  value={form.username}
                  onChange={e => setForm(p => ({ ...p, username: e.target.value.replace(/[^a-zA-Z0-9_]/g, "") }))}
                  placeholder="username"
                  className="pl-7 border-gray-200 focus:border-gray-400 focus:ring-0"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Bio</Label>
              <textarea
                value={form.bio}
                onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                placeholder="Tell people about your music taste..."
                rows={3}
                maxLength={200}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 resize-none transition-colors"
              />
              <p className="text-xs text-gray-400 text-right">{form.bio.length}/200</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Favorite Genre */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Fav Genre</Label>
                <Select value={form.favoriteGenre} onValueChange={v => setForm(p => ({ ...p, favoriteGenre: v }))}>
                  <SelectTrigger className="border-gray-200">
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {genres.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Favorite Singer */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                  <FaMicrophone className="w-3 h-3" />Fav Artist
                </Label>
                <Input
                  value={form.favoriteSinger}
                  onChange={e => setForm(p => ({ ...p, favoriteSinger: e.target.value }))}
                  placeholder="e.g. The Weeknd"
                  className="border-gray-200 focus:border-gray-400 focus:ring-0"
                />
              </div>
            </div>

            {/* Spotify URL */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                <FaSpotify className="w-3.5 h-3.5 text-green-500" />Spotify Profile URL
              </Label>
              <Input
                value={form.spotifyUrl}
                onChange={e => setForm(p => ({ ...p, spotifyUrl: e.target.value }))}
                placeholder="https://open.spotify.com/user/..."
                className="border-gray-200 focus:border-gray-400 focus:ring-0"
              />
              <p className="text-xs text-gray-400">Share your Spotify with your followers</p>
            </div>

            {/* Error / Success */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
            )}
            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600 flex items-center gap-2">
                <FaCheck className="w-3.5 h-3.5" />Profile saved successfully!
              </div>
            )}

            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-black text-white hover:bg-gray-800 h-11 rounded-xl"
            >
              {isSaving
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />Saving...</>
                : "Save Changes"
              }
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
