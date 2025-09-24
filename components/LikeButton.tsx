'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

interface LikeButtonProps {
  postId: string;
  initialLikeCount: number;
  className?: string;
}

export default function LikeButton({ postId, initialLikeCount, className = '' }: LikeButtonProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount || 0);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');

  // Initialize session ID and check like status
  useEffect(() => {
    const initSession = () => {
      // Get or create session ID
      let sid = localStorage.getItem('vibe_session_id');
      if (!sid) {
        sid = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('vibe_session_id', sid);
      }
      setSessionId(sid);
      
      // Check if this session has liked the post
      checkLikeStatus(sid);
    };

    initSession();
  }, [postId]);

  const checkLikeStatus = async (sid: string) => {
    try {
      const { data, error } = await supabase
        .from('anonymous_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('session_id', sid)
        .maybeSingle();
      
      if (!error && data) {
        setLiked(true);
      }
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  const handleLike = async () => {
    if (!sessionId || loading) return;

    setLoading(true);
    
    try {
      // Optimistically update UI
      const newLikedState = !liked;
      setLiked(newLikedState);
      setLikeCount(prev => newLikedState ? prev + 1 : Math.max(0, prev - 1));

      // Call the RPC function to toggle like
      const { data, error } = await supabase.rpc('toggle_anonymous_like', {
        p_post_id: postId,
        p_session_id: sessionId,
        p_ip_hash: null
      });

      if (error) {
        // Revert optimistic update on error
        setLiked(!newLikedState);
        setLikeCount(prev => !newLikedState ? prev + 1 : Math.max(0, prev - 1));
        throw error;
      }

      // The RPC function returns true if liked, false if unliked
      if (data !== newLikedState) {
        // Sync with server state if different
        setLiked(data);
      }

      // Fetch fresh count from database
      const { data: postData } = await supabase
        .from('posts')
        .select('anonymous_likes_count')
        .eq('id', postId)
        .single();

      if (postData) {
        // Get authenticated likes count
        const { count: authLikes } = await supabase
          .from('likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', postId);

        // Get anonymous likes count
        const { count: anonLikes } = await supabase
          .from('anonymous_likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', postId);

        const totalLikes = (authLikes || 0) + (anonLikes || 0);
        setLikeCount(totalLikes);
      }

    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: 'Error',
        description: 'Could not update like. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLike}
      variant={liked ? 'default' : 'outline'}
      size="sm"
      className={`gap-2 ${className}`}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
      )}
      <span>{likeCount}</span>
    </Button>
  );
}