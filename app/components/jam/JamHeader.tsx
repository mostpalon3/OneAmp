"use client"

import { FaEye, FaClock } from "react-icons/fa"
import { BiTrendingUp } from "react-icons/bi"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { fetchJamHeaderDetails } from "@/app/lib/utils/api-utils"

export function JamHeader() {
  const params = useParams();
  const jamId = String(params.jamId);
  interface JamDetails {
  id: string;
  title: string;
  genre: string;
  createdBy: string;
  createdAt: string;
}

  // Store jam details in state
  const [jamDetails, setJamDetails] = useState<JamDetails | null>(null);

  useEffect(() => {
    if (jamId) {
      fetchJamHeaderDetails(jamId)
        .then((data) => {
          if (data) {
            setJamDetails(data);
          } else {
            setJamDetails(null);
          }
        })
        .catch((error) => {
          setJamDetails(null);
          console.error("Error fetching jam header details:", error);
        });
    }
  }, [jamId]);

  return (
    <div className="mb-6">
      <div className="flex items-center space-x-4 mb-2">
        <div className="w-12 h-12 bg-gradient-to-br from-black to-gray-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-lg">
            {jamDetails?.title?.[0]?.toUpperCase() || "J"}
            {jamDetails?.title?.split(" ")?.[1]?.[0]?.toUpperCase() || "M"}
          </span>
        </div>
        <div>
          <h1 className="md:text-2xl text-md font-bold text-black">
            {jamDetails?.title || ""}
          </h1>
          <p className="text-gray-600 md:text-sm text-xs">
            {jamDetails?.genre || "Collaborative Music Queue"}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-6 text-sm text-gray-500">
        <div className="flex items-center space-x-2">
          <FaEye className="w-4 h-4" />
          <span className="md:text-sm text-[0.6rem]">Live Jam</span>
        </div>
        <div className="flex items-center space-x-2">
          <FaClock className="w-4 h-4" />
          <span className="md:text-sm text-[0.6rem]">Active Session</span>
        </div>
        <div className="flex items-center space-x-2">
          <BiTrendingUp className="w-4 h-4" />
          <span className="md:text-sm text-[0.6rem]">Real-time Voting</span>
        </div>
      </div>
    </div>
  )
}