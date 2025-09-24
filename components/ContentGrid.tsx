'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ContentCard from '@/components/ContentCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Loader2, TrendingUp, Clock, Heart, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface ContentGridProps {
  type: 'trending' | 'recent' | 'popular';
  limit?: number;
  showHeader?: boolean;
}

export default function ContentGrid({ type, limit = 8, showHeader = true }: ContentGridProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, [type]);

  const fetchPosts = async () => {
    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          users!inner(username, avatar_url),
          likes(count)
        `);

      if (type === 'recent') {
        query = query.order('created_at', { ascending: false });
      } else if (type === 'popular') {
        query = query.order('view_count', { ascending: false });
      } else if (type === 'trending') {
        // Get posts from last 48 hours with most engagement
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        query = query
          .gte('created_at', twoDaysAgo.toISOString())
          .order('view_count', { ascending: false });
      }

      const { data, error } = await query.limit(limit);

      if (error) throw error;

      const postsWithUserData = data?.map((post: any) => ({
        ...post,
        username: post.users?.username,
        avatar_url: post.users?.avatar_url,
        likes_count: post.likes?.[0]?.count || 0,
      }));

      setPosts(postsWithUserData || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    // Implement like functionality
  };

  const handleDownload = async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (post?.file_url) {
      window.open(post.file_url, '_blank');
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'trending':
        return { title: 'Trending Now', icon: TrendingUp, color: 'text-orange-500' };
      case 'recent':
        return { title: 'Latest Uploads', icon: Clock, color: 'text-blue-500' };
      case 'popular':
        return { title: 'Most Popular', icon: Heart, color: 'text-red-500' };
      default:
        return { title: 'Content', icon: Sparkles, color: 'text-purple-500' };
    }
  };

  const { title, icon: Icon, color } = getTitle();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Icon className={`h-12 w-12 mx-auto mb-4 ${color}`} />
        <p className="text-muted-foreground">No content available yet</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`rounded-full p-2 bg-primary/10`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <h2 className="text-2xl font-bold">{title}</h2>
            <Badge variant="secondary">{posts.length} items</Badge>
          </div>
          <Link href="/gallery">
            <Button variant="ghost" size="sm" className="gap-2">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <ContentCard
              post={post}
              onLike={handleLike}
              onDownload={handleDownload}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}