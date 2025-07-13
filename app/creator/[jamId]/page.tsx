"use client";

import JamPage from "@/app/components/JamPage";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CreatorPage() {
    const { data: session, status } = useSession();
      const params = useParams();
      const jamId = params.jamId as string;
      console.log("jamId", jamId);
      const router = useRouter();
    
      useEffect(() => {
        if (status === "loading") return; // Still loading
        if (!session) {
          setTimeout(() => {
            router.push("/"); // Redirect to home if not authenticated
          }, 1000);
          return;
        }
      }, [session, status, router]);
    
      if (status === "loading") {
        return (
          <div className="flex items-center justify-center min-h-screen">
            Loading...
          </div>
        );
      }
    
      if (!session?.user?.id) {
        return (
          <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div>Please sign in to access this Jam</div>
        <button 
          onClick={() => router.push("/")} 
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
        >
          Go Home
        </button>
          </div>
        );
      }
    
    return <JamPage jamId={jamId} playVideo={false}/>
}