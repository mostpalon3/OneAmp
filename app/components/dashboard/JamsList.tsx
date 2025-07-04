"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { FaPlus, FaUsers, FaPlay, FaHeart, FaClock, FaTrash, FaMusic, FaCalendarAlt } from "react-icons/fa"

export interface Jam {
  id: number
  name: string
  createdAt: string
  status: string
  viewers: number
  duration: string
  genre: string
  totalSongs: number
  totalLikes: number
}

interface JamsListProps {
  jams: Jam[]
  onEnterJam: (jamId: number) => void
  onDeleteJam: (jamId: number) => void
  onCreateNewJam: () => void
  getGenreColor: (genre: string) => string
}

export function JamsList({ jams, onEnterJam, onDeleteJam, onCreateNewJam, getGenreColor }: JamsListProps) {
  return (
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
                    {jam.status === "live" && (
                      <Button size="sm" className="bg-black text-white hover:bg-gray-800" onClick={() => onEnterJam(jam.id)}>
                        <FaPlay className="w-3 h-3 mr-1" />
                        Enter
                      </Button>
                    )}
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
                            onClick={() => onDeleteJam(jam.id)}
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
                    <span className="font-medium">{jam.totalLikes}</span>
                    <span>likes</span>
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
                  onClick={onCreateNewJam}
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
  )
}