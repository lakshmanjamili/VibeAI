import Link from 'next/link';
import { Sparkles, Github, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-bold text-gradient">VibeAI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your creative hub for AI-generated content
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Explore</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/gallery" className="hover:text-primary transition-colors">Gallery</Link></li>
              <li><Link href="/weekly-best" className="hover:text-primary transition-colors">Weekly Best</Link></li>
              <li><Link href="/top-likes" className="hover:text-primary transition-colors">Top Likes</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Community</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-colors">About</Link></li>
              <li><Link href="/guidelines" className="hover:text-primary transition-colors">Guidelines</Link></li>
              <li><Link href="/creators" className="hover:text-primary transition-colors">Top Creators</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Connect</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
          <p>© 2024 VibeAI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}