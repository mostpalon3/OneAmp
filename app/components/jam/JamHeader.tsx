"use client"

import { FaEye, FaClock } from "react-icons/fa"
import { BiTrendingUp } from "react-icons/bi"

export function JamHeader() {
  return (
    <div className="mb-6">
      <div className="flex items-center space-x-4 mb-2">
        <div className="w-12 h-12 bg-gradient-to-br from-black to-gray-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-lg">DJ</span>
        </div>
        <div>
          <h1 className="md:text-2xl text-md font-bold text-black">Nirvana's House Party</h1>
          <p className="text-gray-600 md:text-sm text-xs">Collaborative Music Queue</p>
        </div>
      </div>
      <div className="flex items-center space-x-6 text-sm text-gray-500">
        <div className="flex items-center space-x-2">
          <FaEye className="w-4 h-4" />
          <span className="md:text-sm text-xs">Live Jam</span>
        </div>
        <div className="flex items-center space-x-2">
          <FaClock className="w-4 h-4" />
          <span className="md:text-sm text-xs">Active Session</span>
        </div>
        <div className="flex items-center space-x-2">
          <BiTrendingUp className="w-4 h-4" />
          <span className="md:text-sm text-xs">Real-time Voting</span>
        </div>
      </div>
    </div>
  )
}