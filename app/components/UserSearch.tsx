"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { FaSearch, FaMusic } from "react-icons/fa"
import { HiX } from "react-icons/hi"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface UserResult {
  id: string
  name: string
  username: string
  avatar: string
  favoriteGenre: string
  followersCount: number
}

export function UserSearch() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<UserResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 1) {
      setResults([])
      setIsOpen(false)
      return
    }
    setIsSearching(true)
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`)
      if (res.ok) {
        const data = await res.json()
        setResults(data.users || [])
        setIsOpen(data.users?.length > 0)
      }
    } catch {}
    finally { setIsSearching(false) }
  }, [])

  const handleChange = (value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(value), 350)
  }

  const clear = () => {
    setQuery("")
    setResults([])
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={e => handleChange(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Search people..."
          className="w-full pl-9 pr-8 py-2 bg-gray-100 border border-transparent rounded-lg text-sm focus:outline-none focus:bg-white focus:border-gray-300 transition-all"
        />
        {query && (
          <button onClick={clear} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <HiX className="w-3.5 h-3.5" />
          </button>
        )}
        {isSearching && (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
            <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-72 overflow-y-auto">
          {results.map(user => (
            <Link
              key={user.id}
              href={`/profile/${user.id}`}
              onClick={clear}
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
            >
              <Avatar className="w-9 h-9 flex-shrink-0">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-gray-100 text-gray-600 text-sm">
                  {user.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">@{user.username}</p>
              </div>
              {user.favoriteGenre && (
                <span className="text-xs text-gray-400 flex items-center gap-1 flex-shrink-0">
                  <FaMusic className="w-2.5 h-2.5" />{user.favoriteGenre}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
