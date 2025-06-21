"use client"

import { useSession } from "next-auth/react"
import StreamView from "../components/StreamView"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Dashboard() {
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (status === "loading") return // Still loading
        if (!session) {
            router.push("/") // Redirect to home if not authenticated
            return
        }
    }, [session, status, router])

    if (status === "loading") {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>
    }

    if (!session?.user?.id) {
        return <div className="flex items-center justify-center min-h-screen">Please sign in to access dashboard</div>
    }

    return <StreamView creatorId={session.user.id} playVideo={true} />
}
