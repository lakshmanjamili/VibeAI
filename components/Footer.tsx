import Link from 'next/link';
import { Sparkles, Github, Twitter, Zap, Heart, Code2, Rocket } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border/40 bg-gradient-to-b from-background/95 to-background backdrop-blur">
      {/* Animated background effect */}
      <div className="gradient-aurora pointer-events-none absolute inset-0" />

      <div className="container relative z-10 mx-auto px-4 py-12">
        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Sparkles className="h-6 w-6 animate-pulse text-primary" />
                <div className="absolute inset-0 animate-pulse bg-primary/50 blur-xl" />
              </div>
              <span className="text-gradient-supreme text-xl font-bold">VibeAI</span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Your creative hub for AI-generated content. Powered by cutting-edge AI technology.
            </p>
            <div className="flex items-center gap-2 text-xs">
              <Zap className="h-3 w-3 text-yellow-500" />
              <span className="text-muted-foreground">Lightning fast</span>
            </div>
          </div>

          <div>
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              <Rocket className="h-4 w-4 text-primary" />
              Explore
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/gallery"
                  className="inline-block transition-all hover:translate-x-1 hover:text-primary"
                >
                  Gallery
                </Link>
              </li>
              <li>
                <Link
                  href="/weekly-best"
                  className="inline-block transition-all hover:translate-x-1 hover:text-primary"
                >
                  Weekly Best
                </Link>
              </li>
              <li>
                <Link
                  href="/top-likes"
                  className="inline-block transition-all hover:translate-x-1 hover:text-primary"
                >
                  Top Likes
                </Link>
              </li>
              <li>
                <Link
                  href="/upload"
                  className="inline-block transition-all hover:translate-x-1 hover:text-primary"
                >
                  Upload
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              <Heart className="h-4 w-4 text-red-500" />
              Community
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/about"
                  className="inline-block transition-all hover:translate-x-1 hover:text-primary"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/guidelines"
                  className="inline-block transition-all hover:translate-x-1 hover:text-primary"
                >
                  Guidelines
                </Link>
              </li>
              <li>
                <Link
                  href="/creators"
                  className="inline-block transition-all hover:translate-x-1 hover:text-primary"
                >
                  Top Creators
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="inline-block transition-all hover:translate-x-1 hover:text-primary"
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              <Code2 className="h-4 w-4 text-green-500" />
              Connect
            </h3>
            <div className="mb-4 flex space-x-4">
              <a
                href="https://github.com/loukriai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-all hover:scale-110 hover:text-primary"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com/loukriai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-all hover:scale-110 hover:text-primary"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
            <Link
              href="https://loukriai.com"
              target="_blank"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-all hover:text-primary/80"
            >
              Visit Loukri AI
              <Rocket className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Loukri AI Branding Section */}
        <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 p-6">
          <div className="absolute inset-0 animate-gradient-shift bg-gradient-to-r from-primary/5 via-transparent to-pink-500/5" />
          <div className="relative z-10 text-center">
            <div className="mb-3 flex items-center justify-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              <div className="flex items-center gap-2">
                <Code2 className="h-5 w-5 animate-pulse text-primary" />
                <span className="text-gradient-supreme text-sm font-bold">BUILT BY</span>
                <Code2 className="h-5 w-5 animate-pulse text-primary" />
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            </div>

            <Link href="https://loukriai.com" target="_blank" className="group inline-block">
              <h2 className="text-gradient-supreme mb-2 text-2xl font-bold transition-transform group-hover:scale-105 md:text-3xl">
                Loukri AI INC
              </h2>
              <p className="mb-3 text-sm text-muted-foreground">
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

        <div className="border-t border-border/40 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
            <p>© 2024 VibeAI by Loukri AI INC. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="transition-colors hover:text-primary">
                Privacy
              </Link>
              <Link href="/terms" className="transition-colors hover:text-primary">
                Terms
              </Link>
              <span className="flex items-center gap-1">
                Made with <Heart className="h-3 w-3 animate-pulse text-red-500" /> by Loukri AI
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
