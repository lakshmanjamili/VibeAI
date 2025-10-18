'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Star,
  Zap,
  ArrowRight,
  Wand2,
  Rocket,
  Heart,
  Download,
  Users,
} from 'lucide-react';

export default function PremiumHero() {
  const router = useRouter();
  const { scrollY } = useScroll();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Parallax transforms
  const y1 = useTransform(scrollY, [0, 300], [0, 100]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.8]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Generate random particles
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Animated Background Layers */}
      <div className="absolute inset-0">
        {/* Aurora Background */}
        <div className="gradient-aurora absolute inset-0" />

        {/* Mesh Gradient */}
        <div className="absolute inset-0 opacity-30">
          <div className="gradient-supreme absolute inset-0" />
        </div>

        {/* Floating Particles */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-white/20"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
            }}
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Animated Orbs */}
        <motion.div
          className="blob absolute left-1/4 top-1/4 h-96 w-96 rounded-full opacity-20"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        <motion.div
          className="blob absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full opacity-20"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      {/* Main Content */}
      <motion.div
        className="relative z-10 mx-auto max-w-6xl px-4 text-center"
        style={{ opacity, scale }}
      >
        {/* Floating Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-supreme mb-8 inline-flex items-center gap-2 rounded-full px-4 py-2"
        >
          <Sparkles className="h-4 w-4 text-yellow-400" />
          <span className="text-sm font-medium">Powered by Loukri AI</span>
          <Star className="h-4 w-4 animate-pulse text-yellow-400" />
        </motion.div>

        {/* Main Title with 3D Effect */}
        <motion.div
          style={{
            transform: `perspective(1000px) rotateY(${mousePosition.x * 0.5}deg) rotateX(${-mousePosition.y * 0.5}deg)`,
          }}
          className="transform-style-3d"
        >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6 text-7xl font-black md:text-8xl lg:text-9xl"
          >
            <span className="text-gradient-supreme block">VibeAI</span>
            <span className="mt-4 block text-3xl font-medium text-muted-foreground md:text-4xl">
              Where Creativity Meets AI
            </span>
          </motion.h1>
        </motion.div>

        {/* Animated Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mx-auto mb-12 max-w-3xl text-xl text-muted-foreground md:text-2xl"
        >
          Discover, share, and create stunning AI-generated content. Join the revolution of digital
          creativity.
        </motion.p>

        {/* CTA Buttons with Premium Effects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button
            size="lg"
            className="btn-supreme group relative overflow-hidden rounded-full px-8 py-6 text-lg"
            onClick={() => router.push('/gallery')}
          >
            <span className="relative z-10 flex items-center gap-2">
              <Rocket className="h-5 w-5" />
              Explore Gallery
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </span>
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="glass-supreme group rounded-full border-white/20 px-8 py-6 text-lg hover:border-white/40"
            onClick={() => router.push('/upload')}
          >
            <Wand2 className="mr-2 h-5 w-5" />
            Start Creating
            <Sparkles className="ml-2 h-4 w-4 text-yellow-400 transition-transform duration-500 group-hover:rotate-180" />
          </Button>
        </motion.div>

        {/* Floating Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-20 grid grid-cols-2 gap-6 md:grid-cols-4"
        >
          {[
            { icon: Heart, label: 'Total Likes', value: '10K+', color: 'text-pink-400' },
            { icon: Download, label: 'Downloads', value: '50K+', color: 'text-green-400' },
            { icon: Users, label: 'Creators', value: '5K+', color: 'text-purple-400' },
            { icon: Zap, label: 'Daily Uploads', value: '500+', color: 'text-blue-400' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="glass-supreme rounded-2xl p-6"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: 'spring', stiffness: 300 }}
              style={{ y: y1 }}
            >
              <stat.icon className={`h-8 w-8 ${stat.color} mx-auto mb-3`} />
              <div className="mb-1 text-3xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-muted-foreground"
          >
            <div className="flex h-10 w-6 justify-center rounded-full border-2 border-current">
              <motion.div
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="mt-2 h-3 w-1 rounded-full bg-current"
              />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Decorative Elements */}
      <motion.div
        className="absolute left-10 top-10 text-6xl opacity-10"
        style={{ y: y2 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        ⚡
      </motion.div>
      <motion.div
        className="absolute bottom-10 right-10 text-6xl opacity-10"
        style={{ y: y1 }}
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      >
        ✨
      </motion.div>
      <motion.div
        className="absolute right-20 top-1/2 text-4xl opacity-10"
        animate={{
          y: [0, -30, 0],
          rotate: [0, 180, 360],
        }}
        transition={{ duration: 10, repeat: Infinity }}
      >
        🎨
      </motion.div>
    </section>
  );
}
