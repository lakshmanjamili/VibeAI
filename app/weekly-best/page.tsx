'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ContentCard from '@/components/ContentCard';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { Trophy, TrendingUp, Calendar, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export default function WeeklyBestPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeeklyBest();
  }, []);

  const fetchWeeklyBest = async () => {
    try {
      // Get date 7 days ago
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Query posts from last 7 days
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(
          `
          *,
          users!inner(username, avatar_url)
        `
        )
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Error:', postsError);
        throw postsError;
      }

      // Get likes count for each post
      const postsWithMetrics = await Promise.all(
        (postsData || []).map(async (post: any) => {
          const { count: likesCount } = await supabase
            .from('likes')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id);

          return {
            ...post,
            username: post.users?.username,
            avatar_url: post.users?.avatar_url,
            total_likes_count: likesCount || 0,
            comments_count: post.comments_count || 0,
          };
        })
      );

      // Sort by likes count
      postsWithMetrics.sort((a: any, b: any) => b.total_likes_count - a.total_likes_count);

      // Take top 20
      setPosts(postsWithMetrics.slice(0, 20));
    } catch (error) {
      console.error('Error fetching weekly best:', error);
      toast({
        title: 'Error',
        description: 'Failed to load weekly best posts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    // Implementation similar to gallery page
  };

  const handleDownload = async (postId: string) => {
    // Implementation similar to gallery page
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pb-12 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-full bg-yellow-500/10 p-3">
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">
                Weekly <span className="text-gradient">Best</span>
              </h1>
              <p className="mt-1 flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Top performing content from the past 7 days
              </p>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : posts.length === 0 ? (
          <div className="py-20 text-center">
            <Trophy className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <p className="text-muted-foreground">No posts yet this week</p>
          </div>
        ) : (
          <>
            {posts.slice(0, 3).map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="mb-8"
              >
                <div className="mb-4 flex items-center gap-4">
                  <div
                    className={`rounded-full p-3 ${
                      index === 0
                        ? 'bg-yellow-500/20'
                        : index === 1
                          ? 'bg-gray-400/20'
                          : 'bg-orange-600/20'
                    }`}
                  >
                    <Trophy
                      className={`h-6 w-6 ${
                        index === 0
                          ? 'text-yellow-500'
                          : index === 1
                            ? 'text-gray-400'
                            : 'text-orange-600'
                      }`}
                    />
                  </div>
                  <div>
                    <Badge variant={index === 0 ? 'default' : 'secondary'}>
                      #{index + 1} This Week
                    </Badge>
                    <p className="mt-1 text-sm text-muted-foreground">{post.likes_count} likes</p>
                  </div>
                </div>

                <div className="max-w-md">
                  <ContentCard post={post} onLike={handleLike} onDownload={handleDownload} />
                </div>
              </motion.div>
            ))}

            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {posts.slice(3).map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <ContentCard post={post} onLike={handleLike} onDownload={handleDownload} />
                </motion.div>
              ))}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
