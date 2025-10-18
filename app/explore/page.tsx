'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PostCard from '@/components/PostCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { PostWithMetrics } from '@/types/database';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, 
  TrendingUp, 
  Clock, 
  Sparkles, 
  Search,
  Filter,
  Grid3x3,
  LayoutGrid,
  Heart,
  Eye,
  Download,
  MessageSquare,
  Wand2,
  Film,
  Camera,
  Video,
  Image as ImageIcon,
  BookOpen,
  Crown,
  Flame,
  Zap,
  Star,
  RefreshCw
} from 'lucide-react';

interface ExploreCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  gradient: string;
}

const EXPLORE_CATEGORIES: ExploreCategory[] = [
  {
    id: 'ai_generated',
    name: 'AI Generated',
    icon: Wand2,
    description: 'Content created with AI',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    id: 'trending',
    name: 'Trending Now',
    icon: TrendingUp,
    description: 'Popular this week',
    gradient: 'from-orange-500 to-red-500'
  },
  {
    id: 'most_liked',
    name: 'Most Liked',
    icon: Heart,
    description: 'Community favorites',
    gradient: 'from-pink-500 to-red-500'
  },
  {
    id: 'recent',
    name: 'Fresh Content',
    icon: Clock,
    description: 'Just uploaded',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'videos',
    name: 'Videos',
    icon: Video,
    description: 'Motion content',
    gradient: 'from-red-500 to-pink-500'
  },
  {
    id: 'images',
    name: 'Images',
    icon: Camera,
    description: 'Photos & Art',
    gradient: 'from-green-500 to-emerald-500'
  }
];

interface AIModelStats {
  model: string;
  count: number;
  icon: React.ElementType;
  color: string;
}

export default function ExplorePage() {
  const router = useRouter();
  const { userId } = useAuth();
  const [posts, setPosts] = useState<PostWithMetrics[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<PostWithMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedModel, setSelectedModel] = useState('all');
  const [sortBy, setSortBy] = useState('trending');
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [modelStats, setModelStats] = useState<AIModelStats[]>([]);
  const [timeFilter, setTimeFilter] = useState('all');

  useEffect(() => {
    fetchPosts();
    fetchModelStats();
  }, [sortBy, timeFilter]);

  useEffect(() => {
    filterPosts();
  }, [posts, selectedCategory, selectedModel, searchQuery]);

  const fetchPosts = async () => {
    try {
      let query = (supabase as any).from('posts_with_metrics').select('*');

      // Time filter
      if (timeFilter !== 'all') {
        const date = new Date();
        if (timeFilter === 'today') date.setDate(date.getDate() - 1);
        else if (timeFilter === 'week') date.setDate(date.getDate() - 7);
        else if (timeFilter === 'month') date.setMonth(date.getMonth() - 1);
        
        query = query.gte('created_at', date.toISOString());
      }

      // Sorting
      switch (sortBy) {
        case 'trending':
          query = query.order('view_count', { ascending: false });
          break;
        case 'likes':
          query = query.order('total_likes_count', { ascending: false });
          break;
        case 'recent':
          query = query.order('created_at', { ascending: false });
          break;
        case 'downloads':
          query = query.order('download_count', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load content',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchModelStats = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('posts')
        .select('ai_model')
        .not('ai_model', 'is', null);

      if (error) throw error;

      // Count by model
      const stats = data.reduce((acc: any, post: any) => {
        const model = post.ai_model;
        if (model) {
          acc[model] = (acc[model] || 0) + 1;
        }
        return acc;
      }, {});

      // Convert to array with icons
      const modelStatsArray: AIModelStats[] = Object.entries(stats).map(([model, count]) => ({
        model,
        count: count as number,
        icon: getModelIcon(model),
        color: getModelColor(model)
      })).sort((a, b) => b.count - a.count);

      setModelStats(modelStatsArray);
    } catch (error) {
      console.error('Error fetching model stats:', error);
    }
  };

  const getModelIcon = (model: string): React.ElementType => {
    if (model.includes('gemini')) return Sparkles;
    if (model.includes('grok')) return Zap;
    if (model.includes('imagen')) return Camera;
    if (model.includes('veo')) return Film;
    if (model.includes('wan')) return Star;
    return Wand2;
  };

  const getModelColor = (model: string): string => {
    if (model.includes('gemini')) return 'text-blue-500';
    if (model.includes('grok')) return 'text-orange-500';
    if (model.includes('imagen')) return 'text-purple-500';
    if (model.includes('veo')) return 'text-red-500';
    if (model.includes('wan')) return 'text-green-500';
    return 'text-gray-500';
  };

  const filterPosts = () => {
    let filtered = [...posts];

    // Category filter
    if (selectedCategory === 'ai_generated') {
      filtered = filtered.filter(p => p.ai_model);
    } else if (selectedCategory === 'videos') {
      filtered = filtered.filter(p => p.category === 'video');
    } else if (selectedCategory === 'images') {
      filtered = filtered.filter(p => p.category === 'photo' || p.category === 'gif');
    }

    // Model filter
    if (selectedModel !== 'all') {
      filtered = filtered.filter(p => p.ai_model === selectedModel);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.title?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.prompt?.toLowerCase().includes(query) ||
        p.hashtags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredPosts(filtered);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-20 pb-12">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-4">
            <Compass className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Explore</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient-supreme">Discover Amazing Content</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore AI-generated art, videos, and creative content from our community
          </p>
        </motion.div>

        {/* Category Cards */}
        <ScrollArea className="w-full whitespace-nowrap mb-8">
          <div className="flex space-x-4 pb-4">
            {EXPLORE_CATEGORIES.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex-shrink-0 ${
                  selectedCategory === category.id ? 'scale-105' : ''
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card className={`w-40 h-32 cursor-pointer overflow-hidden ${
                  selectedCategory === category.id ? 'border-primary' : ''
                }`}>
                  <div className={`h-1 bg-gradient-to-r ${category.gradient}`} />
                  <CardContent className="p-4 flex flex-col items-center justify-center h-full">
                    <category.icon className="h-6 w-6 mb-2" />
                    <h3 className="font-semibold text-sm">{category.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {category.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* AI Model Statistics */}
        {modelStats.length > 0 && (
          <Card className="mb-8 glass-supreme">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                AI Models Used
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant={selectedModel === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedModel('all')}
                >
                  All Models
                </Button>
                {modelStats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <Button
                      key={stat.model}
                      variant={selectedModel === stat.model ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedModel(stat.model)}
                      className="gap-2"
                    >
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                      {stat.model}
                      <Badge variant="secondary" className="ml-1">
                        {stat.count}
                      </Badge>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters Bar */}
        <div className="flex flex-wrap gap-4 mb-8 items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="trending">
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Trending
                </span>
              </SelectItem>
              <SelectItem value="likes">
                <span className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Most Liked
                </span>
              </SelectItem>
              <SelectItem value="recent">
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Recent
                </span>
              </SelectItem>
              <SelectItem value="downloads">
                <span className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Downloads
                </span>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Time Filter */}
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'masonry' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('masonry')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>

          {/* Refresh */}
          <Button
            variant="outline"
            size="icon"
            onClick={fetchPosts}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredPosts.length} of {posts.length} results
          </p>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <Card className="py-20 text-center">
            <CardContent>
              <Compass className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No content found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or search query
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'masonry' 
              ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' 
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          }`}>
            <AnimatePresence>
              {filteredPosts.map((post, index) => (
                <PostCard key={post.id} post={post} index={index} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}