'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ContentCard from '@/components/ContentCard';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { Heart, Crown, Sparkles, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export default function TopLikesPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopLiked();
  }, []);

  const fetchTopLiked = async () => {
    try {
      // Query all posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          users!inner(username, avatar_url)
        `)
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
            comments_count: post.comments_count || 0
          };
        })
      );

      // Sort by likes count
      postsWithMetrics.sort((a: any, b: any) => b.total_likes_count - a.total_likes_count);

      // Take top 20
      setPosts(postsWithMetrics.slice(0, 20));
    } catch (error) {
      console.error('Error fetching top liked posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load top liked posts',
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
            <div className="rounded-full bg-red-500/10 p-3">
              <Heart className="h-8 w-8 text-red-500" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">
                Top <span className="text-gradient">Likes</span>
              </h1>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <Sparkles className="h-4 w-4" />
                Most loved content of all time
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
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No posts yet</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              {posts.slice(0, 3).map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="absolute -top-4 -right-4 z-10">
                    <div
                      className={`rounded-full p-3 shadow-lg ${
                        index === 0
                          ? 'bg-gradient-to-br from-yellow-400 to-yellow-600'
                          : index === 1
                          ? 'bg-gradient-to-br from-gray-300 to-gray-500'
                          : 'bg-gradient-to-br from-orange-400 to-orange-600'
                      }`}
                    >
                      <Crown className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <Badge
                      variant={index === 0 ? 'default' : 'secondary'}
                      className="gap-1"
                    >
                      <Heart className="h-3 w-3" />
                      {post.likes_count} likes
                    </Badge>
                  </div>
                  
                  <ContentCard
                    post={post}
                    onLike={handleLike}
                    onDownload={handleDownload}
                  />
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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