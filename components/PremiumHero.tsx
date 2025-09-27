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
  Users
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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background Layers */}
      <div className="absolute inset-0">
        {/* Aurora Background */}
        <div className="absolute inset-0 gradient-aurora" />
        
        {/* Mesh Gradient */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 gradient-supreme" />
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
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Animated Orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blob opacity-20"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blob opacity-20"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Main Content */}
      <motion.div 
        className="relative z-10 text-center px-4 max-w-6xl mx-auto"
        style={{ opacity, scale }}
      >
        {/* Floating Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-supreme mb-8"
        >
          <Sparkles className="h-4 w-4 text-yellow-400" />
          <span className="text-sm font-medium">Powered by Loukri AI</span>
          <Star className="h-4 w-4 text-yellow-400 animate-pulse" />
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
            className="text-7xl md:text-8xl lg:text-9xl font-black mb-6"
          >
            <span className="text-gradient-supreme block">VibeAI</span>
            <span className="text-3xl md:text-4xl font-medium text-muted-foreground mt-4 block">
              Where Creativity Meets AI
            </span>
          </motion.h1>
        </motion.div>

        {/* Animated Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto"
        >
          Discover, share, and create stunning AI-generated content.
          Join the revolution of digital creativity.
        </motion.p>

        {/* CTA Buttons with Premium Effects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button
            size="lg"
            className="btn-supreme text-lg px-8 py-6 rounded-full group relative overflow-hidden"
            onClick={() => router.push('/gallery')}
          >
            <span className="relative z-10 flex items-center gap-2">
              <Rocket className="h-5 w-5" />
              Explore Gallery
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="text-lg px-8 py-6 rounded-full glass-supreme border-white/20 hover:border-white/40 group"
            onClick={() => router.push('/upload')}
          >
            <Wand2 className="h-5 w-5 mr-2" />
            Start Creating
            <Sparkles className="h-4 w-4 ml-2 text-yellow-400 group-hover:rotate-180 transition-transform duration-500" />
          </Button>
        </motion.div>

        {/* Floating Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6"
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
              transition={{ type: "spring", stiffness: 300 }}
              style={{ y: y1 }}
            >
              <stat.icon className={`h-8 w-8 ${stat.color} mb-3 mx-auto`} />
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
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
            <div className="w-6 h-10 border-2 border-current rounded-full flex justify-center">
              <motion.div
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1 h-3 bg-current rounded-full mt-2"
              />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Decorative Elements */}
      <motion.div
        className="absolute top-10 left-10 text-6xl opacity-10"
        style={{ y: y2 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        ⚡
      </motion.div>
      <motion.div
        className="absolute bottom-10 right-10 text-6xl opacity-10"
        style={{ y: y1 }}
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      >
        ✨
      </motion.div>
      <motion.div
        className="absolute top-1/2 right-20 text-4xl opacity-10"
        animate={{ 
          y: [0, -30, 0],
          rotate: [0, 180, 360]
        }}
        transition={{ duration: 10, repeat: Infinity }}
      >
        🎨
      </motion.div>
    </section>
  );
}