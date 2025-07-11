"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FaPlus, FaHashtag, FaPlay, FaBars, FaTimes } from "react-icons/fa"
import { BiMusic } from "react-icons/bi"
import { signOut } from "next-auth/react"
import { useState } from "react"

interface DashboardHeaderProps {
  jamName: string
  setJamName: (name: string) => void
  jamGenre: string
  setJamGenre: (genre: string) => void
  jamId: string
  setJamId: (id: string) => void
  isCreating: boolean
  isJoining: boolean
  isCreateDialogOpen: boolean
  setIsCreateDialogOpen: (open: boolean) => void
  isJoinDialogOpen: boolean
  setIsJoinDialogOpen: (open: boolean) => void
  handleCreateJam: () => void
  handleJoinJam: (jamId: string) => void
  genres: string[]
}
const isMobile = window.innerWidth < 768

export function DashboardHeader({
  jamName,
  setJamName,
  jamGenre,
  setJamGenre,
  jamId,
  setJamId,
  isCreating,
  isJoining,
  isCreateDialogOpen,
  setIsCreateDialogOpen,
  isJoinDialogOpen,
  setIsJoinDialogOpen,
  handleCreateJam,
  handleJoinJam,
  genres
}: DashboardHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <BiMusic className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-black">OneAmp</span>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Join Jam Dialog */}
          <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 text-[0.6rem] md:text-sm">
                <FaHashtag className="w-0 h-0 md:w-4 md:h-4 mr-2" />
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
                        handleJoinJam(jamId)
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
                    onClick={() => handleJoinJam(jamId)}
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

          {/* Create Jam Dialog */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-black text-white hover:bg-gray-800 text-[0.6rem] md:text-sm">
                <FaPlus className="w-1 h-1 md:w-4 md:h-4 mr-2" />
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
                        <FaPlus className="mr-2 w-4 h-4 " />
                        Create Jam
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Sign Out Button */}
          <Button 
            variant="ghost" 
            size="sm"
            className="text-gray-600 hover:text-black text-sm px-4" 
            onClick={() => signOut()}
          >
            <span>Sign out</span>
          </Button>
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden flex items-center">
          <button
            className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-black"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Open menu"
          >
            {mobileMenuOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 py-4 space-y-3">
          {/* Join Jam Dialog */}
          <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 text-sm mb-2">
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
                        handleJoinJam(jamId)
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
                    onClick={() => handleJoinJam(jamId)}
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

          {/* Create Jam Dialog */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-black text-white hover:bg-gray-800 text-sm mb-2">
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
                        <FaPlus className="mr-2 w-4 h-4 " />
                        Create Jam
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Sign Out Button */}
          <Button 
            variant="ghost" 
            size="sm"
            className="w-full text-gray-600 hover:text-black text-sm px-4" 
            onClick={() => signOut()}
          >
            <span>Sign out</span>
          </Button>
        </div>
      )}
    </header>
  )
}