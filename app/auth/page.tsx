"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { FaGoogle, FaCheck } from "react-icons/fa"
import { BiMusic } from "react-icons/bi"

export default function AuthPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [isCheckingProfile, setIsCheckingProfile] = useState(false)

  // Check authentication status and redirect accordingly
  useEffect(() => {
    if (status === "loading") return

    if (session?.user) {
      // User is authenticated, check if profile is complete
      checkProfileAndRedirect()
    }
  }, [session, status])

  const checkProfileAndRedirect = async () => {
    setIsCheckingProfile(true)
    
    try {
      const response = await fetch("/api/complete-profile", {
        method: "GET"
      })
      
      if (response.status === 404) {
        // Profile not found, redirect to complete profile
        router.push("/complete-profile")
        return
      }
      
      if (response.ok) {
        const data = await response.json()
        if (data.profile?.profileCompleted) {
          // Profile is complete, redirect to dashboard
          router.push(`/dashboards/${session?.user?.id}`)
        } else {
          // Profile exists but not completed, redirect to complete profile
          router.push("/complete-profile")
        }
      } else {
        console.error("Failed to check profile completion")
        // Fallback: redirect to complete profile
        router.push("/complete-profile")
      }
    } catch (error) {
      console.error("Error checking profile completion:", error)
      // Fallback: redirect to complete profile
      router.push("/complete-profile")
    } finally {
      setIsCheckingProfile(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true)
    
    try {
      const result = await signIn("google", {
        redirect: false,
        callbackUrl: "/auth"
      })

      if (result?.error) {
        console.error("Sign in error:", result.error)
        // TODO: Show error message to user
      }
      // If successful, the useEffect will handle the redirect
    } catch (error) {
      console.error("Sign in failed:", error)
      // TODO: Show error message to user
    } finally {
      setIsSigningIn(false)
    }
  }

  // Show loading state while checking authentication or profile
  if (status === "loading" || isCheckingProfile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If user is already authenticated, don't show sign in form (redirect will happen)
  if (session?.user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <BiMusic className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-medium text-black">OneAmp</span>
          </Link>
          <h1 className="text-2xl font-medium text-black mb-2">Welcome to OneAmp</h1>
          <p className="text-gray-600">Sign in to start creating and joining music jams</p>
        </div>

        {/* Sign In Card */}
        <Card className="border border-gray-200">
          <CardContent className="p-8">
            <Button
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              {isSigningIn ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-3" />
                  Signing in...
                </>
              ) : (
                <>
                  <FaGoogle className="w-4 h-4 mr-3 text-red-500" />
                  Continue with Google
                </>
              )}
            </Button>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                By continuing, you agree to our{" "}
                <Link href="/terms" className="underline hover:text-black">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline hover:text-black">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-8 space-y-3">
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
              <FaCheck className="w-2 h-2 text-green-600" />
            </div>
            <span>Create and manage music jams</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
              <FaCheck className="w-2 h-2 text-blue-600" />
            </div>
            <span>Vote on songs with your audience</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <div className="w-4 h-4 bg-purple-100 rounded-full flex items-center justify-center">
              <FaCheck className="w-2 h-2 text-purple-600" />
            </div>
            <span>Stream from YouTube and Spotify</span>
          </div>
        </div>
      </div>
    </div>
  )
}