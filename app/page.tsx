"use client";

import { AppBar } from "./components/AppBar";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import {
  FaSpotify,
  FaYoutube,
  FaUsers,
  FaVoteYea,
  FaStream,
  FaMobile,
  FaArrowRight,
  FaPlay,
} from "react-icons/fa"
import { BiMusic, BiTrendingUp, BiDevices } from "react-icons/bi"
import { HiOutlineSparkles } from "react-icons/hi"
import { Footer } from "./components/Footer";
import { Redirect } from "./components/Redirect";

export default function LandingPage() {
  console.log("Google Client ID:", process.env.GOOGLE_CLIENT_ID);
  console.log("Google Client Secret:", process.env.GOOGLE_CLIENT_SECRET);
  return (
        <div className="flex flex-col min-h-screen bg-white">
            <AppBar />
            <Redirect/>
          <main className="flex-1">
              {/* Hero Section */}
              <section className="py-20 lg:py-32 bg-gradient-to-b from-gray-50 to-white">
                <div className="container mx-auto px-4 lg:px-6">
                  <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2 mb-8">
                      <HiOutlineSparkles className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-600">Stream. Vote. Vibe Together.</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-black mb-6 leading-tight">
                      One Device.
                      <br />
                      <span className="text-gray-600">Endless Music.</span>
                    </h1>

                    <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                      Stream music from Spotify and YouTube on a single platform. Let your audience vote and shape the queue
                      in real-time.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
                      <Button size="lg" className="bg-black text-white hover:bg-gray-800 px-8 py-3 text-lg">
                        Start Streaming
                        <FaArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 text-lg"
                      >
                        <FaPlay className="mr-2 w-4 h-4" />
                        Watch Demo
                      </Button>
                    </div>

                    <div className="flex items-center justify-center space-x-8 text-gray-500">
                      <div className="flex items-center space-x-2">
                        <FaSpotify className="w-6 h-6" />
                        <span className="text-sm">Spotify</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaYoutube className="w-6 h-6" />
                        <span className="text-sm">YouTube</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaUsers className="w-6 h-6" />
                        <span className="text-sm">Live Voting</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Features Section */}
              <section id="features" className="py-20 bg-white">
                <div className="container mx-auto px-4 lg:px-6">
                  <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Everything you need to stream</h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                      Powerful features designed to make streaming interactive and engaging for both streamers and their
                      audience.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="p-8 rounded-2xl border border-gray-200 hover:border-gray-300 transition-colors">
                      <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-6">
                        <BiDevices className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-black mb-3">One Device Streaming</h3>
                      <p className="text-gray-600">
                        Stream from a single device without the complexity of multiple setups. Simple, efficient, and
                        reliable.
                      </p>
                    </div>

                    <div className="p-8 rounded-2xl border border-gray-200 hover:border-gray-300 transition-colors">
                      <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-6">
                        <BiMusic className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-black mb-3">Multi-Platform Music</h3>
                      <p className="text-gray-600">
                        Add songs from both Spotify and YouTube seamlessly. Access millions of tracks from your favorite
                        platforms.
                      </p>
                    </div>

                    <div className="p-8 rounded-2xl border border-gray-200 hover:border-gray-300 transition-colors">
                      <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-6">
                        <FaVoteYea className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-black mb-3">Live Voting System</h3>
                      <p className="text-gray-600">
                        Let your audience vote and upvote songs in the queue. Democracy meets music streaming.
                      </p>
                    </div>

                    <div className="p-8 rounded-2xl border border-gray-200 hover:border-gray-300 transition-colors">
                      <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-6">
                        <FaStream className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-black mb-3">Real-time Streaming</h3>
                      <p className="text-gray-600">
                        High-quality, low-latency streaming that keeps your audience engaged and connected.
                      </p>
                    </div>

                    <div className="p-8 rounded-2xl border border-gray-200 hover:border-gray-300 transition-colors">
                      <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-6">
                        <BiTrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-black mb-3">Analytics Dashboard</h3>
                      <p className="text-gray-600">
                        Track your stream performance, audience engagement, and popular songs with detailed analytics.
                      </p>
                    </div>

                    <div className="p-8 rounded-2xl border border-gray-200 hover:border-gray-300 transition-colors">
                      <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-6">
                        <FaMobile className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-black mb-3">Mobile Optimized</h3>
                      <p className="text-gray-600">
                        Stream and manage your queue from any device. Full mobile support for streamers and viewers.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* How It Works Section */}
              <section id="how-it-works" className="py-20 bg-gray-50">
                <div className="container mx-auto px-4 lg:px-6">
                  <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">How OneAmp Works</h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                      Get started in minutes and transform how you stream music with your audience.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-white font-bold text-xl">1</span>
                      </div>
                      <h3 className="text-xl font-semibold text-black mb-3">Connect Your Accounts</h3>
                      <p className="text-gray-600">
                        Link your Spotify and YouTube accounts to access your music libraries and playlists.
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-white font-bold text-xl">2</span>
                      </div>
                      <h3 className="text-xl font-semibold text-black mb-3">Start Your Stream</h3>
                      <p className="text-gray-600">
                        Begin streaming from your device and share your stream link with your audience.
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-white font-bold text-xl">3</span>
                      </div>
                      <h3 className="text-xl font-semibold text-black mb-3">Let Audience Vote</h3>
                      <p className="text-gray-600">
                        Your viewers can vote on songs, add requests, and shape the music queue in real-time.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Stats Section */}
              <section className="py-20 bg-black text-white">
                <div className="container mx-auto px-4 lg:px-6">
                  <div className="grid md:grid-cols-4 gap-8 text-center">
                    <div>
                      <div className="text-4xl font-bold mb-2">10K+</div>
                      <div className="text-gray-400">Active Streamers</div>
                    </div>
                    <div>
                      <div className="text-4xl font-bold mb-2">1M+</div>
                      <div className="text-gray-400">Songs Played</div>
                    </div>
                    <div>
                      <div className="text-4xl font-bold mb-2">50K+</div>
                      <div className="text-gray-400">Votes Cast</div>
                    </div>
                    <div>
                      <div className="text-4xl font-bold mb-2">99.9%</div>
                      <div className="text-gray-400">Uptime</div>
                    </div>
                  </div>
                </div>
              </section>

              {/* CTA Section */}
              <section className="py-20 bg-white">
                <div className="container mx-auto px-4 lg:px-6">
                  <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">Ready to revolutionize your streams?</h2>
                    <p className="text-xl text-gray-600 mb-10">
                      Join thousands of streamers who are already creating more engaging experiences with OneAmp.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        className="max-w-sm border-gray-300 focus:border-black"
                      />
                      <Button className="bg-black text-white hover:bg-gray-800 px-8">Get Early Access</Button>
                    </div>

                    <p className="text-sm text-gray-500">
                      No spam, unsubscribe at any time. By signing up, you agree to our{" "}
                      <Link href="/terms" className="underline hover:text-black">
                        Terms of Service
                      </Link>
                    </p>
                  </div>
                </div>
              </section>
          </main>
      <Footer/>
      </div>
  );
}
