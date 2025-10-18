'use client';

import Link from 'next/link';
import { useAuth, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Sparkles, Upload, Home, Trophy, Heart, Wand2, Compass } from 'lucide-react';

export default function Navbar() {
  const { isSignedIn } = useAuth();

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-primary/20 bg-gradient-to-r from-white/80 via-purple-50/80 to-pink-50/80 dark:from-slate-900/80 dark:via-purple-900/30 dark:to-blue-900/30 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-gradient">VibeAI</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/" className="flex items-center space-x-1 text-sm font-medium transition-colors hover:text-primary">
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
              <Link href="/explore" className="flex items-center space-x-1 text-sm font-medium transition-colors hover:text-primary">
                <Compass className="h-4 w-4" />
                <span>Explore</span>
              </Link>
              <Link href="/trending" className="flex items-center space-x-1 text-sm font-medium transition-colors hover:text-primary">
                <Trophy className="h-4 w-4" />
                <span>Trending</span>
              </Link>
              <Link href="/ai-studio" className="flex items-center space-x-1 text-sm font-medium transition-colors hover:text-primary">
                <Wand2 className="h-4 w-4" />
                <span>AI Studio</span>
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isSignedIn ? (
              <>
                <Link href="/upload">
                  <Button size="sm" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Upload
                  </Button>
                </Link>
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}