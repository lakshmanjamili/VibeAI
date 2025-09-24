'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import PremiumHero from '@/components/PremiumHero';
import Footer from '@/components/Footer';
import AboutSection from '@/components/AboutSection';
import FeaturesSection from '@/components/FeaturesSection';
import ContentGrid from '@/components/ContentGrid';
import StatsWidget from '@/components/StatsWidget';
import CategoryShowcase from '@/components/CategoryShowcase';
import CreatorSpotlight from '@/components/CreatorSpotlight';
import ActivityFeed from '@/components/ActivityFeed';
import PostCard from '@/components/PostCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Heart, 
  Film, 
  Video, 
  BookOpen, 
  ImageIcon,
  ArrowRight,
  Loader2,
  Eye,
  Download,
  Users,
  Zap,
  Star
} from 'lucide-react';
import Link from 'next/link';

interface CategoryStat {
  category: string;
  count: number;
  icon: any;
  color: string;
}

export default function HomePage() {
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<any[]>([]);
  const [popularPosts, setPopularPosts] = useState<any[]>([]);
  const [featuredCreators, setFeaturedCreators] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recent');

  useEffect(() => {
    fetchAllContent();
    fetchStats();
    fetchFeaturedCreators();
  }, []);

  const fetchAllContent = async () => {
    try {
      // Fetch recent posts
      const { data: recent } = await supabase
        .from('posts_with_metrics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(12);

      // Fetch trending (most viewed in last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: trending } = await supabase
        .from('posts_with_metrics')
        .select('*')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('view_count', { ascending: false })
        .limit(8);

      // Fetch popular (most liked)
      const { data: popular } = await supabase
        .from('posts_with_metrics')
        .select('*')
        .order('total_likes_count', { ascending: false })
        .limit(8);

      setRecentPosts(recent || []);
      setTrendingPosts(trending || []);
      setPopularPosts(popular || []);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data: postCount } = await supabase
        .from('posts')
        .select('id', { count: 'exact', head: true });

      const { data: userCount } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true });

      const { data: categoryStats } = await supabase
        .from('posts')
        .select('category')
        .then(result => {
          const counts: any = {};
          result.data?.forEach(post => {
            counts[post.category] = (counts[post.category] || 0) + 1;
          });
          return { data: counts };
        });

      setStats({
        totalPosts: postCount || 0,
        totalUsers: userCount || 0,
        categories: categoryStats || {}
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchFeaturedCreators = async () => {
    try {
      // Get top creators by post count and engagement
      const { data } = await supabase
        .from('users')
        .select(`
          id,
          username,
          avatar_url,
          posts:posts(count)
        `)
        .limit(5);

      setFeaturedCreators(data || []);
    } catch (error) {
      console.error('Error fetching creators:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'photo': return ImageIcon;
      case 'video': return Video;
      case 'gif': return Film;
      case 'storybook': return BookOpen;
      default: return ImageIcon;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'photo': return 'text-blue-500';
      case 'video': return 'text-purple-500';
      case 'gif': return 'text-green-500';
      case 'storybook': return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };

  const categoryStats: CategoryStat[] = [
    { category: 'Photos', count: stats?.categories?.photo || 0, icon: ImageIcon, color: 'bg-blue-500' },
    { category: 'Videos', count: stats?.categories?.video || 0, icon: Video, color: 'bg-purple-500' },
    { category: 'GIFs', count: stats?.categories?.gif || 0, icon: Film, color: 'bg-green-500' },
    { category: 'Storybooks', count: stats?.categories?.storybook || 0, icon: BookOpen, color: 'bg-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Hero Section */}
        <PremiumHero />
        
        {/* Recent User Uploads - Featured Section */}
        <section className="py-16 bg-gradient-to-b from-background to-background/50">
          <div className="container mx-auto px-4">
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <Badge className="mb-4" variant="outline">
                <Sparkles className="mr-1 h-3 w-3" />
                Fresh Content Daily
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Latest <span className="text-gradient">Creations</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Discover what our creative community is sharing right now
              </p>
            </motion.div>

            {/* Recent Uploads Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {recentPosts.slice(0, 8).map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <PostCard post={post} index={index} />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* View More Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-12 text-center"
            >
              <Link href="/gallery">
                <Button size="lg" className="gap-2">
                  Explore Gallery
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Quick Stats Bar */}
        <section className="py-8 bg-primary/5 border-y">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-primary">{stats?.totalPosts || 0}+</div>
                <div className="text-sm text-muted-foreground">Creations</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-primary">{stats?.totalUsers || 0}+</div>
                <div className="text-sm text-muted-foreground">Creators</div>
              </motion.div>
              {categoryStats.map((stat, index) => (
                <motion.div
                  key={stat.category}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="flex items-center gap-2 justify-center">
                    <stat.icon className={`h-5 w-5 ${stat.color.replace('bg-', 'text-')}`} />
                    <div className="text-2xl font-bold">{stat.count}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.category}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Trending & Popular Content */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
                <TabsTrigger value="recent" className="gap-2">
                  <Clock className="h-4 w-4" />
                  Latest
                </TabsTrigger>
                <TabsTrigger value="trending" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Trending
                </TabsTrigger>
                <TabsTrigger value="popular" className="gap-2">
                  <Heart className="h-4 w-4" />
                  Popular
                </TabsTrigger>
              </TabsList>
              
              <AnimatePresence mode="wait">
                <TabsContent value="recent" className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                  >
                    {recentPosts.slice(8, 12).map((post, index) => (
                      <PostCard key={post.id} post={post} index={index} />
                    ))}
                  </motion.div>
                </TabsContent>
                
                <TabsContent value="trending" className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                  >
                    {trendingPosts.map((post, index) => (
                      <PostCard key={post.id} post={post} index={index} />
                    ))}
                  </motion.div>
                </TabsContent>
                
                <TabsContent value="popular" className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                  >
                    {popularPosts.map((post, index) => (
                      <PostCard key={post.id} post={post} index={index} />
                    ))}
                  </motion.div>
                </TabsContent>
              </AnimatePresence>
            </Tabs>
          </div>
        </section>

        {/* Featured Creators */}
        {featuredCreators.length > 0 && (
          <section className="py-16 bg-gradient-to-b from-background to-primary/5">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <Badge className="mb-4" variant="outline">
                  <Star className="mr-1 h-3 w-3" />
                  Top Creators
                </Badge>
                <h2 className="text-3xl font-bold mb-4">Featured Creators</h2>
                <p className="text-muted-foreground">
                  Meet the talented individuals shaping our community
                </p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-6">
                {featuredCreators.map((creator, index) => (
                  <motion.div
                    key={creator.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Link href={`/user/${creator.id}`}>
                      <Card className="hover:shadow-lg transition-shadow p-6 text-center">
                        <img
                          src={creator.avatar_url || '/default-avatar.png'}
                          alt={creator.username}
                          className="w-20 h-20 rounded-full mx-auto mb-3"
                        />
                        <h3 className="font-semibold">{creator.username}</h3>
                        <p className="text-sm text-muted-foreground">
                          {creator.posts?.[0]?.count || 0} posts
                        </p>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Category Showcase */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <CategoryShowcase />
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-4" variant="outline">
                <Zap className="mr-1 h-3 w-3" />
                Join the Movement
              </Badge>
              <h2 className="text-4xl font-bold mb-4">
                Ready to Share Your <span className="text-gradient">AI Creations?</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of creators showcasing their AI-generated masterpieces
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/upload">
                  <Button size="lg" className="gap-2">
                    Start Creating
                    <Sparkles className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/gallery">
                  <Button size="lg" variant="outline" className="gap-2">
                    Browse Gallery
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  );
}