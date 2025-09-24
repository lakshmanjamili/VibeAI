'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ContentCard from '@/components/ContentCard';
import GalleryFilter from '@/components/GalleryFilter';
import { supabase } from '@/lib/supabase';
import { Post, PostCategory } from '@/types/database';
import { useAuth } from '@clerk/nextjs';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

export default function GalleryPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<PostCategory | 'all'>('all');
  const [sort, setSort] = useState<'latest' | 'popular' | 'trending'>('latest');
  const { userId } = useAuth();

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('posts_with_metrics')
        .select('*');

      if (category !== 'all') {
        query = query.eq('category', category);
      }

      if (sort === 'latest') {
        query = query.order('created_at', { ascending: false });
      } else if (sort === 'popular') {
        query = query.order('total_likes_count', { ascending: false });
      } else if (sort === 'trending') {
        // Sort by recent likes and views
        query = query
          .order('view_count', { ascending: false })
          .order('total_likes_count', { ascending: false });
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;

      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load posts. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [category, sort]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleLike = async (postId: string) => {
    if (!userId) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to like posts',
      });
      return;
    }

    try {
      const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .maybeSingle() as { data: { id: string } | null };

      if (existingLike) {
        await supabase.from('likes').delete().eq('id', existingLike.id);
      } else {
        await supabase.from('likes').insert({
          post_id: postId,
          user_id: userId,
        } as any);
      }
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  const handleDownload = async (postId: string) => {
    try {
      const post = posts.find((p) => p.id === postId);
      if (post?.file_url) {
        window.open(post.file_url, '_blank');
      }
    } catch (error) {
      console.error('Error handling download:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-20 pb-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">
            Explore <span className="text-gradient">Gallery</span>
          </h1>
          <p className="text-muted-foreground">
            Discover amazing AI-generated content from our creative community
          </p>
        </div>

        <GalleryFilter onCategoryChange={setCategory} onSortChange={setSort} />

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No posts found. Be the first to share!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
            {posts.map((post) => (
              <ContentCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onDownload={handleDownload}
              />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}