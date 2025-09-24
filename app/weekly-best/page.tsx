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
      const { data, error } = await supabase
        .from('weekly_top_posts')
        .select('*');

      if (error) throw error;

      setPosts(data || []);
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
      <main className="container mx-auto px-4 pt-20 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-full bg-yellow-500/10 p-3">
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">
                Weekly <span className="text-gradient">Best</span>
              </h1>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
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
          <div className="text-center py-20">
            <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
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
                <div className="flex items-center gap-4 mb-4">
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
                    <p className="text-sm text-muted-foreground mt-1">
                      {post.likes_count} likes
                    </p>
                  </div>
                </div>
                
                <div className="max-w-md">
                  <ContentCard
                    post={post}
                    onLike={handleLike}
                    onDownload={handleDownload}
                  />
                </div>
              </motion.div>
            ))}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-12">
              {posts.slice(3).map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <ContentCard
                    post={post}
                    onLike={handleLike}
                    onDownload={handleDownload}
                  />
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