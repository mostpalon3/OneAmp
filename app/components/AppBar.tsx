import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BiMusic } from "react-icons/bi"

export function AppBar(){
    const session = useSession();
    return (
        
        <header className="border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <BiMusic className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-black">OneAmp</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-gray-600 hover:text-black transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-gray-600 hover:text-black transition-colors">
              How it Works
            </Link>
            <Link href="#pricing" className="text-gray-600 hover:text-black transition-colors">
              Pricing
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            {session.data?.user && <Button variant="ghost" className="text-gray-600 hover:text-black" onClick={() => signOut()}>
              Sign out
            </Button>}
            {!session.data?.user &&<Button variant="ghost" className="text-gray-600 hover:text-black" onClick={() => signIn()}>
              Sign In
            </Button>}
            <Button className="bg-black text-white hover:bg-gray-800">Get Started</Button>
          </div>
        </div>
      </header>

    )
}