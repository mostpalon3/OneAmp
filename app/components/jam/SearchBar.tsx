"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { FaSearch, FaPlus, FaYoutube } from "react-icons/fa"
import { HiX } from "react-icons/hi"
import { submitStream } from "@/app/lib/utils/api-utils"

interface SearchResult {
  videoId: string
  title: string
  artist: string
  thumbnail: string
  duration: number
  url: string
}

interface SearchBarProps {
  jamId: string
  onSongAdded: () => Promise<void> | void
}

export function SearchBar({ jamId, onSongAdded }: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [addingId, setAddingId] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const searchYouTube = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }

    setIsSearching(true)
    try {
      const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(q)}`)
      if (res.ok) {
        const data = await res.json()
        setResults(data.results || [])
        setIsOpen(data.results?.length > 0)
      }
    } catch (err) {
      console.error("Search failed:", err)
    } finally {
      setIsSearching(false)
    }
  }, [])

  const handleInputChange = (value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => searchYouTube(value), 400)
  }

  const handleAddSong = async (result: SearchResult) => {
    setAddingId(result.videoId)
    try {
      const responseData = await submitStream(jamId, result.url)
      const streamId = responseData?.stream?.id

      // Auto-upvote using the database stream ID
      if (streamId) {
        try {
          await fetch("/api/streams/upvote", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ streamId }),
          })
        } catch {}
      }

      await Promise.resolve(onSongAdded())
      setQuery("")
      setResults([])
      setIsOpen(false)
    } catch (err) {
      console.error("Failed to add song:", err)
    } finally {
      setAddingId(null)
    }
  }

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  const clearSearch = () => {
    setQuery("")
    setResults([])
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className="relative mb-4">
      {/* Search Input */}
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Search for songs..."
          className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-colors"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <HiX className="w-4 h-4" />
          </button>
        )}
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {results.map((result) => (
            <div
              key={result.videoId}
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
            >
              {/* Thumbnail */}
              <img
                src={result.thumbnail}
                alt={result.title}
                className="w-14 h-10 rounded object-cover flex-shrink-0"
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{result.title}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FaYoutube className="w-3 h-3 text-red-500 flex-shrink-0" />
                  <span className="truncate">{result.artist}</span>
                  <span>·</span>
                  <span>{formatDuration(result.duration)}</span>
                </div>
              </div>

              {/* Add Button */}
              <button
                onClick={() => handleAddSong(result)}
                disabled={addingId === result.videoId}
                className="flex-shrink-0 p-2 rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {addingId === result.videoId ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FaPlus className="w-3 h-3" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
