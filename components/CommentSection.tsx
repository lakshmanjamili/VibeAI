'use client';

import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import { Comment } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Send, User } from 'lucide-react';

interface CommentSectionProps {
  postId: string;
}

interface CommentWithUser extends Comment {
  users?: {
    username: string;
    avatar_url: string | null;
  };
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { userId, isSignedIn } = useAuth();
  const { user } = useUser();
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [newComment, setNewComment] = useState('');
  const [anonymousName, setAnonymousName] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Get or create anonymous session ID
  const getAnonymousId = () => {
    if (typeof window === 'undefined') return '';
    let anonId = localStorage.getItem('vibe_anon_id');
    if (!anonId) {
      anonId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('vibe_anon_id', anonId);
    }
    return anonId;
  };

  useEffect(() => {
    fetchComments();

    // Set up real-time subscription for new comments
    const channel = supabase
      .channel(`comments-${postId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'comments',
        filter: `post_id=eq.${postId}`
      }, handleNewComment)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          users:user_id(username, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewComment = (payload: any) => {
    // Add new comment to the list
    fetchComments(); // Refetch to get user data
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a comment',
        variant: 'destructive',
      });
      return;
    }

    if (!isSignedIn && !anonymousName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your name to comment anonymously',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      let commentData: any = {
        post_id: postId,
        content: newComment,
        is_anonymous: !isSignedIn,
      };

      if (isSignedIn && userId) {
        // Get user from database
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('clerk_id', userId)
          .single();

        if (userData) {
          commentData.user_id = (userData as any).id;
        }
      } else {
        // Anonymous comment
        commentData.anonymous_name = anonymousName;
        commentData.anonymous_id = getAnonymousId();
      }

      const { error } = await supabase
        .from('comments')
        .insert(commentData);

      if (error) throw error;

      // Update comments count - fetch current count and increment
      const { data: postData } = await supabase
        .from('posts')
        .select('comments_count')
        .eq('id', postId)
        .single();

      const currentCount = (postData as any)?.comments_count || 0;
      
      await (supabase as any)
        .from('posts')
        .update({ comments_count: currentCount + 1 })
        .eq('id', postId);

      setNewComment('');
      toast({
        title: 'Success',
        description: 'Your comment has been posted',
      });

      // Refetch comments
      fetchComments();
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to post comment',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isSignedIn && (
          <div>
            <Input
              placeholder="Your name (optional)"
              value={anonymousName}
              onChange={(e) => setAnonymousName(e.target.value)}
              className="max-w-xs"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Comment anonymously or sign in for more features
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <Avatar className="h-10 w-10">
            {isSignedIn && user ? (
              <>
                <AvatarImage src={user.imageUrl} />
                <AvatarFallback>
                  {user.username?.slice(0, 2).toUpperCase() || 'U'}
                </AvatarFallback>
              </>
            ) : (
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            )}
          </Avatar>

          <div className="flex-1 space-y-3">
            <Textarea
              placeholder="Share your thoughts..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />
            <Button type="submit" disabled={submitting} className="gap-2">
              <Send className="h-4 w-4" />
              {submitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="h-10 w-10">
                {comment.users?.avatar_url ? (
                  <AvatarImage src={comment.users.avatar_url} />
                ) : null}
                <AvatarFallback>
                  {comment.is_anonymous ? (
                    <User className="h-5 w-5" />
                  ) : (
                    comment.users?.username?.slice(0, 2).toUpperCase() || 'U'
                  )}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-sm">
                    {comment.is_anonymous
                      ? comment.anonymous_name || 'Anonymous'
                      : comment.users?.username || 'User'}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}