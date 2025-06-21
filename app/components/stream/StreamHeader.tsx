"use client"

import { FaEye, FaClock } from "react-icons/fa"
import { BiTrendingUp } from "react-icons/bi"

export function StreamHeader() {
  return (
    <div className="mb-6">
      <div className="flex items-center space-x-4 mb-2">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-lg">DJ</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-black">DExTer Music Stream</h1>
          <p className="text-gray-600">Collaborative Music Queue</p>
        </div>
      </div>
      <div className="flex items-center space-x-6 text-sm text-gray-500">
        <div className="flex items-center space-x-1">
          <FaEye className="w-4 h-4" />
          <span>Live Stream</span>
        </div>
        <div className="flex items-center space-x-1">
          <FaClock className="w-4 h-4" />
          <span>Active Session</span>
        </div>
        <div className="flex items-center space-x-1">
          <BiTrendingUp className="w-4 h-4" />
          <span>Real-time Voting</span>
        </div>
      </div>
    </div>
  )
}