import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BiMusic } from "react-icons/bi"
import { usePathname } from "next/navigation";
import { FaShare, FaUsers } from "react-icons/fa";
import { handleShare } from "./stream/HandleShare";

const NAVIGATION_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it Works" },
  { href: "#pricing", label: "Pricing" },
] as const;

const Logo = () => (
  <Link href="/" className="flex items-center space-x-2">
    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
      <BiMusic className="w-5 h-5 text-white" />
    </div>
    <span className="text-xl font-bold text-black">OneAmp</span>
  </Link>
);

const HomeNavigation = () => (
  <nav className="hidden md:flex items-center space-x-8">
    {NAVIGATION_LINKS.map(({ href, label }) => (
      <Link 
        key={href}
        href={href} 
        className="text-gray-600 hover:text-black transition-colors"
      >
        {label}
      </Link>
    ))}
  </nav>
);

const DashboardStatus = ({ creatorId }: { creatorId: string }) => (
  <div className="flex items-center space-x-4">
    <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-1">
      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
      <span className="text-sm text-gray-600">Live</span>
    </div>
    <div className="flex items-center space-x-1 text-gray-600">
      <FaUsers className="w-4 h-4" />
      <span className="text-sm">1,247</span>
    </div>
    <Button variant="ghost" size="sm" onClick={() => handleShare(creatorId)} >
      <FaShare className="w-4 h-4" />
    </Button>
  </div>
);

const AuthButtons = ({ isAuthenticated, isHomePage }: { isAuthenticated: boolean; isHomePage: boolean }) => (
  <div className="flex items-center space-x-4">
    {isAuthenticated ? (
      <Button 
        variant="ghost" 
        className="text-gray-600 hover:text-black" 
        onClick={() => signOut()}
      >
        Sign out
      </Button>
    ) : (
      <Button 
        variant="ghost" 
        className="text-gray-600 hover:text-black" 
        onClick={() => signIn()}
      >
        Sign In
      </Button>
    )}
    {isHomePage && (
      <Button className="bg-black text-white hover:bg-gray-800">
        Get Started
      </Button>
    )}
  </div>
);

// Fix the component signature
export function AppBar({ creatorId }: { creatorId?: string } = {}) {
  const session = useSession();
  const pathname = usePathname();
  
  const isHomePage = pathname === "/";
  const isDashboard = pathname === "/dashboard" || pathname.startsWith("/creator/");
  const isAuthenticated = Boolean(session.data?.user);

  return (
    <header className="border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
        <Logo />
        
        {isHomePage && <HomeNavigation />}
        {isDashboard && creatorId && <DashboardStatus creatorId={creatorId} />}
        
        <AuthButtons isAuthenticated={isAuthenticated} isHomePage={isHomePage} />
      </div>
    </header>
  );
}