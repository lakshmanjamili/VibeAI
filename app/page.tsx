'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PostCard from '@/components/PostCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import {
  Sparkles,
  Rocket,
  Wand2,
  Brain,
  Zap,
  Star,
  ArrowRight,
  CheckCircle2,
  Users,
  Globe,
  Shield,
  TrendingUp,
  Camera,
  Film,
  MessageSquare,
  Palette,
  Crown,
  Heart,
  Play,
  ChevronRight,
  Infinity,
  BarChart3,
  Code2,
  Layers,
  Target,
  Clock,
  Eye,
  Download,
  Loader2,
  Video,
  BookOpen,
  ImageIcon,
  Gift,
  Compass,
  Filter,
} from 'lucide-react';

// Animated background particles
const FloatingParticle = ({ delay = 0 }: { delay?: number }) => (
  <motion.div
    className="absolute h-2 w-2 rounded-full bg-primary/20"
    animate={{
      y: [-20, -100, -20],
      x: [-20, 20, -20],
      opacity: [0, 1, 0],
    }}
    transition={{
      duration: 10,
      delay,
      repeat: Number.POSITIVE_INFINITY,
      ease: 'easeInOut',
    }}
    style={{
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
    }}
  />
);

// Feature card component
interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  gradient: string;
  delay?: number;
}

const FeatureCard = ({ icon: Icon, title, description, gradient, delay = 0 }: FeatureCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    viewport={{ once: true }}
    whileHover={{ scale: 1.05, rotate: 1 }}
    className="relative"
  >
    <Card className="h-full overflow-hidden border-primary/20 bg-background/50 backdrop-blur-sm">
      <div className={`h-1 bg-gradient-to-r ${gradient}`} />
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={`rounded-lg bg-gradient-to-r p-3 ${gradient}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  </motion.div>
);

// Stats component
interface StatCardProps {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  delay?: number;
}

const StatCard = ({ value, label, icon: Icon, delay = 0 }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.5 }}
    whileInView={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, delay }}
    viewport={{ once: true }}
    className="text-center"
  >
    <div className="flex flex-col items-center gap-2">
      <Icon className="mb-2 h-8 w-8 text-primary" />
      <motion.h3
        className="text-gradient-supreme text-4xl font-bold"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1, delay: delay + 0.2 }}
        viewport={{ once: true }}
      >
        {value}
      </motion.h3>
      <p className="text-muted-foreground">{label}</p>
    </div>
  </motion.div>
);

export default function HomePage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('trending');
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      // Fetch recent posts
      const { data: recent } = await supabase
        .from('posts_with_metrics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(8);

      // Fetch trending posts
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: trending } = await supabase
        .from('posts_with_metrics')
        .select('*')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('view_count', { ascending: false })
        .limit(8);

      setRecentPosts(recent || []);
      setTrendingPosts(trending || []);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: Layers,
      title: '4+ AI Models in One Platform',
      description:
        'Only platform with Nano Banana, Imagen, Grok & Veo. Switch models instantly - no other platform offers this variety!',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Palette,
      title: 'Images, Videos & Storybooks',
      description:
        'Create any type of content you imagine. From stunning photos to cinematic videos to interactive storybooks.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Users,
      title: 'Instagram for AI Creators',
      description:
        'Share your work, discover trending content, follow creators. The first social platform built exclusively for AI art.',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: Crown,
      title: 'No Competition. Period.',
      description:
        "We're the ONLY platform combining multiple AI models with a vibrant creator community. Others don't even come close.",
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: Zap,
      title: 'One Platform, Infinite Possibilities',
      description:
        'Why juggle multiple tools? Get everything in one place - multiple models, multiple formats, one amazing community.',
      gradient: 'from-yellow-500 to-amber-500',
    },
    {
      icon: TrendingUp,
      title: 'Discover & Get Discovered',
      description:
        "See what's trending, learn from top creators, get your work featured. Build your audience like Instagram, but for AI.",
      gradient: 'from-indigo-500 to-purple-500',
    },
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950/30 dark:via-slate-900 dark:to-blue-950/30">
      <Navbar />

      {/* Animated background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-200/20 via-pink-200/20 to-blue-200/20 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-blue-900/20" />
        {[...Array(20)].map((_, i) => (
          <FloatingParticle key={i} delay={i * 0.5} />
        ))}
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(139, 92, 246, 0.15), transparent 40%)`,
          }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative flex min-h-[90vh] items-center justify-center pt-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mx-auto max-w-5xl text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2"
            >
              <Sparkles className="h-4 w-4 animate-pulse text-primary" />
              <span className="text-sm font-medium">The Instagram of AI Creation</span>
              <Badge variant="secondary" className="ml-2">
                World's First Multi-Model Platform
              </Badge>
            </motion.div>

            {/* Main heading with gradient animation */}
            <motion.h1
              className="mb-6 text-5xl font-bold md:text-7xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="inline-block">Create, Share & Discover</span>
              <br />
              <span className="text-gradient-supreme inline-block">AI Masterpieces</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="mx-auto mb-8 max-w-3xl text-xl text-muted-foreground md:text-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              The only platform with 4+ AI models • Images, Videos & Storybooks • Vibrant creator
              community • No other platform does this!
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="mb-12 flex flex-col justify-center gap-4 sm:flex-row"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Button
                size="lg"
                className="gap-2 px-8 py-6 text-lg"
                onClick={() => router.push('/gallery')}
              >
                <Eye className="h-5 w-5" />
                View Gallery
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 bg-gradient-to-r from-primary to-purple-600 px-8 py-6 text-lg hover:from-primary/90 hover:to-purple-600/90"
                onClick={() => router.push(isSignedIn ? '/ai-studio' : '/sign-up')}
              >
                <MessageSquare className="h-5 w-5" />
                {isSignedIn ? 'Start Creating' : 'Sign Up to Create'}
              </Button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-500" />
                <span>100% Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <span>Instant Access</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 transform"
          animate={{
            y: [0, 10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut',
          }}
        >
          <div className="flex h-10 w-6 justify-center rounded-full border-2 border-primary/50">
            <div className="mt-2 h-3 w-1 rounded-full bg-primary/50" />
          </div>
        </motion.div>
      </section>

      {/* Explore Preview Section */}
      <section className="bg-gradient-to-b from-background to-primary/5 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2">
              <Compass className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">NEW: Explore Feature</span>
            </div>
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">
              Discover <span className="text-gradient-supreme">Amazing Creations</span>
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground">
              Browse through thousands of AI-generated artworks. Filter by model, category, or
              popularity.
            </p>
          </motion.div>

          {/* Explore Features Grid */}
          <div className="mx-auto mb-12 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6 text-center transition-shadow hover:shadow-lg">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Filter className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold">Smart Filters</h3>
                <p className="text-sm text-muted-foreground">
                  Filter by AI model, time period, category, or popularity
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 text-center transition-shadow hover:shadow-lg">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold">Trending Content</h3>
                <p className="text-sm text-muted-foreground">
                  See what's popular today, this week, or all time
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6 text-center transition-shadow hover:shadow-lg">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold">AI Model Stats</h3>
                <p className="text-sm text-muted-foreground">
                  See which models are being used most by creators
                </p>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Button size="lg" className="gap-2" onClick={() => router.push('/explore')}>
              <Compass className="h-5 w-5" />
              Explore Gallery
              <ArrowRight className="h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Community Showcase */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <Badge className="mb-4">COMMUNITY</Badge>
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">
              Trending <span className="text-gradient-supreme">Creations</span>
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              See what our community is creating right now
            </p>
          </motion.div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="mx-auto grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="trending" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Trending
              </TabsTrigger>
              <TabsTrigger value="recent" className="gap-2">
                <Clock className="h-4 w-4" />
                Recent
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <TabsContent value="trending" className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
                    >
                      {trendingPosts.slice(0, 8).map((post, index) => (
                        <PostCard key={post.id} post={post} index={index} />
                      ))}
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="recent" className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
                    >
                      {recentPosts.slice(0, 8).map((post, index) => (
                        <PostCard key={post.id} post={post} index={index} />
                      ))}
                    </motion.div>
                  </TabsContent>
                </>
              )}
            </AnimatePresence>
          </Tabs>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <Link href="/explore">
              <Button size="lg" variant="outline" className="gap-2">
                Explore All Content
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative bg-gradient-to-b from-primary/5 to-background py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <Badge className="mb-4">WHY WE'RE DIFFERENT</Badge>
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">
              The Only Platform That Does <span className="text-gradient-supreme">All of This</span>
            </h2>
            <p className="mx-auto max-w-3xl text-xl text-muted-foreground">
              No competitor offers multiple AI models + community in one place. We're pioneering the
              future of AI creation.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <FeatureCard key={i} {...feature} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <Badge className="mb-4">HOW IT WORKS</Badge>
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">
              Simple <span className="text-gradient-supreme">3-Step Process</span>
            </h2>
          </motion.div>
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <span className="text-3xl font-bold">1</span>
              </div>
              <h3 className="mb-2 text-xl font-semibold">Join Free</h3>
              <p className="text-muted-foreground">
                Create your account and get instant access to 4+ AI models
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <span className="text-3xl font-bold">2</span>
              </div>
              <h3 className="mb-2 text-xl font-semibold">Create Anything</h3>
              <p className="text-muted-foreground">
                Generate images, videos, or storybooks using multiple AI models in one place
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <span className="text-3xl font-bold">3</span>
              </div>
              <h3 className="mb-2 text-xl font-semibold">Share & Go Viral</h3>
              <p className="text-muted-foreground">
                Post to your profile, get discovered by the community, grow your following like
                Instagram
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Available Models */}
      <section className="bg-gradient-to-b from-background to-primary/5 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <Badge className="mb-4">MULTI-MODEL POWERHOUSE</Badge>
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">
              4+ AI Models. <span className="text-gradient-supreme">One Platform.</span>
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              Switch between Nano Banana, Imagen, Grok, and Veo instantly. No other platform gives
              you this choice.
            </p>
          </motion.div>

          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Nano Banana */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <Card className="relative h-full border-2 border-primary/50">
                <div className="h-1 bg-gradient-to-r from-yellow-500 to-orange-500" />
                <CardHeader>
                  <div className="mb-2 flex items-center gap-2">
                    <ImageIcon className="h-6 w-6 text-primary" />
                    <Badge>Active</Badge>
                  </div>
                  <CardTitle className="text-lg">Nano Banana</CardTitle>
                  <p className="text-sm text-muted-foreground">Ultra-fast image generation</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-500" />
                      <span>Instant photos</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-500" />
                      <span>Multiple styles</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Imagen */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <Card className="relative h-full border-2 border-primary/50">
                <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
                <CardHeader>
                  <div className="mb-2 flex items-center gap-2">
                    <Camera className="h-6 w-6 text-primary" />
                    <Badge>Active</Badge>
                  </div>
                  <CardTitle className="text-lg">Imagen</CardTitle>
                  <p className="text-sm text-muted-foreground">Google's image AI</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-500" />
                      <span>Photorealistic</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-500" />
                      <span>High quality</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Grok */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
            >
              <Card className="relative h-full border-2 border-primary/50">
                <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
                <CardHeader>
                  <div className="mb-2 flex items-center gap-2">
                    <Brain className="h-6 w-6 text-primary" />
                    <Badge>Active</Badge>
                  </div>
                  <CardTitle className="text-lg">Grok</CardTitle>
                  <p className="text-sm text-muted-foreground">Advanced AI generation</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-500" />
                      <span>Creative output</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-500" />
                      <span>Smart prompts</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Veo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
            >
              <Card className="relative h-full border-2 border-primary/50">
                <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
                <CardHeader>
                  <div className="mb-2 flex items-center gap-2">
                    <Film className="h-6 w-6 text-primary" />
                    <Badge>Active</Badge>
                  </div>
                  <CardTitle className="text-lg">Veo</CardTitle>
                  <p className="text-sm text-muted-foreground">Video creation AI</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-500" />
                      <span>AI videos</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-500" />
                      <span>Cinematic</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* CTA below models */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <Button
              size="lg"
              className="gap-2"
              onClick={() => router.push(isSignedIn ? '/ai-studio' : '/sign-up')}
            >
              <Wand2 className="h-5 w-5" />
              {isSignedIn ? 'Try All Models Now' : 'Join to Access All Models'}
              <ArrowRight className="h-5 w-5" />
            </Button>
            <p className="mt-4 text-sm text-muted-foreground">
              ✨ No other platform offers this many models in one place
            </p>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/20 to-purple-600/20 p-12 text-center backdrop-blur-sm"
          >
            <div className="bg-grid-white/5 absolute inset-0" />
            <div className="relative z-10">
              <h2 className="mb-4 text-4xl font-bold md:text-5xl">
                Join the World's First{' '}
                <span className="text-gradient-supreme">Multi-Model AI Platform</span>
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground">
                The Instagram of AI Creation awaits. 4+ models, unlimited creativity, vibrant
                community. Start for free today.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Button
                  size="lg"
                  className="gap-2 px-8 py-6 text-lg"
                  onClick={() => router.push('/ai-studio')}
                >
                  <Wand2 className="h-5 w-5" />
                  Start Creating Now
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 px-8 py-6 text-lg"
                  onClick={() => router.push('/explore')}
                >
                  <Compass className="h-5 w-5" />
                  Explore Gallery
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
