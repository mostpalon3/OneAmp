"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HiOutlineSparkles } from "react-icons/hi"

export function DashboardSidebar() {
  return (
    <div className="space-y-6">
      {/* How It Works */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-black">
            <HiOutlineSparkles className="w-5 h-5" />
            <span>How Jams Work</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white font-bold text-xs">1</span>
              </div>
              <div>
                <h4 className="font-medium text-black text-sm">Create Your Jam</h4>
                <p className="text-xs text-gray-600">Start a new music session with a custom name and genre</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white font-bold text-xs">2</span>
              </div>
              <div>
                <h4 className="font-medium text-black text-sm">Add Music</h4>
                <p className="text-xs text-gray-600">Share YouTube links to build your queue</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white font-bold text-xs">3</span>
              </div>
              <div>
                <h4 className="font-medium text-black text-sm">Let Others Vote</h4>
                <p className="text-xs text-gray-600">Your audience votes on what plays next</p>
              </div>
            </div>
          </div>
          
          {/* Platform Stats */}
            {/* <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-black text-sm">Platform Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Streamers</span>
                  <span className="font-semibold text-black">1,247</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Jams Today</span>
                  <span className="font-semibold text-black">3,892</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Songs Played</span>
                  <span className="font-semibold text-black">12,456</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Votes Cast</span>
                  <span className="font-semibold text-black">45,123</span>
                </div>
              </CardContent>
            </Card> */}

            {/* Quick Actions */}
            {/* <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-sm text-black">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <FaHeart className="w-4 h-4 mr-2" />
                  My Favorites
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <BiTrendingUp className="w-4 h-4 mr-2" />
                  Trending Jams
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <FaUsers className="w-4 h-4 mr-2" />
                  Following
                </Button>
              </CardContent>
            </Card> */}

        </CardContent>
      </Card>
    </div>
  )
}