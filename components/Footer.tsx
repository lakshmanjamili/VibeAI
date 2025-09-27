import Link from 'next/link';
import { Sparkles, Github, Twitter, Zap, Heart, Code2, Rocket } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative border-t border-border/40 bg-gradient-to-b from-background/95 to-background backdrop-blur overflow-hidden">
      {/* Animated background effect */}
      <div className="absolute inset-0 gradient-aurora pointer-events-none" />
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                <div className="absolute inset-0 blur-xl bg-primary/50 animate-pulse" />
              </div>
              <span className="font-bold text-xl text-gradient-supreme">VibeAI</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your creative hub for AI-generated content. Powered by cutting-edge AI technology.
            </p>
            <div className="flex items-center gap-2 text-xs">
              <Zap className="h-3 w-3 text-yellow-500" />
              <span className="text-muted-foreground">Lightning fast</span>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Rocket className="h-4 w-4 text-primary" />
              Explore
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/gallery" className="hover:text-primary transition-all hover:translate-x-1 inline-block">Gallery</Link></li>
              <li><Link href="/weekly-best" className="hover:text-primary transition-all hover:translate-x-1 inline-block">Weekly Best</Link></li>
              <li><Link href="/top-likes" className="hover:text-primary transition-all hover:translate-x-1 inline-block">Top Likes</Link></li>
              <li><Link href="/upload" className="hover:text-primary transition-all hover:translate-x-1 inline-block">Upload</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              Community
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-all hover:translate-x-1 inline-block">About</Link></li>
              <li><Link href="/guidelines" className="hover:text-primary transition-all hover:translate-x-1 inline-block">Guidelines</Link></li>
              <li><Link href="/creators" className="hover:text-primary transition-all hover:translate-x-1 inline-block">Top Creators</Link></li>
              <li><Link href="/dashboard" className="hover:text-primary transition-all hover:translate-x-1 inline-block">Dashboard</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Code2 className="h-4 w-4 text-green-500" />
              Connect
            </h3>
            <div className="flex space-x-4 mb-4">
              <a 
                href="https://github.com/loukriai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-all hover:scale-110"
              >
                <Github className="h-5 w-5" />
              </a>
              <a 
                href="https://twitter.com/loukriai" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-all hover:scale-110"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
            <Link 
              href="https://loukriai.com" 
              target="_blank"
              className="text-sm text-primary hover:text-primary/80 font-semibold transition-all inline-flex items-center gap-1"
            >
              Visit Loukri AI
              <Rocket className="h-3 w-3" />
            </Link>
          </div>
        </div>
        
        {/* Loukri AI Branding Section */}
        <div className="relative rounded-xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 p-6 mb-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-pink-500/5 animate-gradient-shift" />
          <div className="relative z-10 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              <div className="flex items-center gap-2">
                <Code2 className="h-5 w-5 text-primary animate-pulse" />
                <span className="text-sm font-bold text-gradient-supreme">BUILT BY</span>
                <Code2 className="h-5 w-5 text-primary animate-pulse" />
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            </div>
            
            <Link 
              href="https://loukriai.com" 
              target="_blank"
              className="inline-block group"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-gradient-supreme mb-2 group-hover:scale-105 transition-transform">
                Loukri AI INC
              </h2>
              <p className="text-sm text-muted-foreground mb-3">
                Empowering creativity with artificial intelligence
              </p>
              <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  AI Innovation
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Next-Gen Tech
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  Community First
                </span>
              </div>
            </Link>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border/40">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2024 VibeAI by Loukri AI INC. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
              <span className="flex items-center gap-1">
                Made with <Heart className="h-3 w-3 text-red-500 animate-pulse" /> by Loukri AI
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}