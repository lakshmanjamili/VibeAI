'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Video, Image, BookOpen, Film } from 'lucide-react';

export default function HeroSection() {
  const categories = [
    { icon: Film, label: 'GIFs', color: 'from-purple-500 to-pink-500' },
    { icon: Video, label: 'Videos', color: 'from-blue-500 to-cyan-500' },
    { icon: BookOpen, label: 'Storybooks', color: 'from-green-500 to-emerald-500' },
    { icon: Image, label: 'Photos', color: 'from-orange-500 to-red-500' },
  ];

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-purple-900 via-black to-blue-900">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      <div className="container relative z-10 mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-primary/10 p-4">
              <Sparkles className="h-12 w-12 text-primary" />
            </div>
          </div>

          <h1 className="mb-6 text-5xl font-bold md:text-7xl">
            <span className="text-gradient">VibeAI</span>
          </h1>

          <p className="mx-auto mb-4 max-w-3xl text-xl text-gray-300 md:text-2xl">
            Your Creative Hub for AI-Generated Content
          </p>

          <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-400">
            Share and discover amazing AI-generated GIFs, videos, storybooks, and photos. Join a
            community where imagination meets cutting-edge AI technology.
          </p>

          <div className="mb-12 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/gallery">
              <Button size="lg" className="gap-2 px-8 text-lg">
                Explore Gallery
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="lg" variant="outline" className="gap-2 px-8 text-lg">
                Join Community
                <Sparkles className="h-5 w-5" />
              </Button>
            </Link>
          </div>

          <div className="mx-auto grid max-w-3xl grid-cols-2 gap-4 md:grid-cols-4">
            {categories.map((category, index) => (
              <motion.div
                key={category.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <div
                  className={`rounded-xl bg-gradient-to-br p-6 ${category.color} border border-white/10 bg-opacity-10 backdrop-blur-sm transition-all hover:scale-105 hover:border-white/30`}
                >
                  <category.icon className="mx-auto mb-2 h-8 w-8 text-white" />
                  <p className="text-sm font-medium text-white">{category.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-gray-500">
            Powered by the latest AI models including Google's Nano Banana
          </p>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
