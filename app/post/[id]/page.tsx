'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CommentSection from '@/components/CommentSection';
import LikeButton from '@/components/LikeButton';
import MediaDisplay from '@/components/MediaDisplay';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { PostWithMetrics } from '@/types/database';
import { 
  Heart, 
  Download, 
  Eye, 
  Share2, 
  Copy, 
  Sparkles,
  Hash,
  Calendar,
  Film,
  Video,
  BookOpen,
  ImageIcon,
  Wand2,
  MessageCircle,
  ChevronLeft
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { useAuth } from '@clerk/nextjs';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { userId } = useAuth();
  const [post, setPost] = useState<PostWithMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPrompt, setShowPrompt] = useState(false);
  const [relatedPosts, setRelatedPosts] = useState<PostWithMetrics[]>([]);

  // Get or create session ID for anonymous interactions
  const getSessionId = () => {
    if (typeof window === 'undefined') return '';
    let sessionId = localStorage.getItem('vibe_session_id');
    if (!sessionId) {
      sessionId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('vibe_session_id', sessionId);
    }
    return sessionId;
  };

  useEffect(() => {
    if (params.id) {
      fetchPost(params.id as string);
      incrementViewCount(params.id as string);
    }
  }, [params.id]);

  const fetchPost = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('posts_with_metrics')
        .select('*')
        .eq('id', postId)
        .single();

      if (error) throw error;

      setPost(data);
      
      // Fetch related posts from the same user
      if ((data as any)?.user_id) {
        fetchRelatedPosts((data as any).user_id, postId);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      toast({
        title: 'Error',
        description: 'Failed to load post',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedPosts = async (authorUserId: string, currentPostId: string) => {
    try {
      const { data, error } = await supabase
        .from('posts_with_metrics')
        .select('*')
        .eq('user_id', authorUserId)
        .neq('id', currentPostId)
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) throw error;

      setRelatedPosts(data || []);
    } catch (error) {
      console.error('Error fetching related posts:', error);
    }
  };

  const incrementViewCount = async (postId: string) => {
    try {
      await (supabase as any)
        .from('posts')
        .update({ view_count: (supabase as any).raw('view_count + 1') })
        .eq('id', postId);
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const handleDownload = async () => {
    if (!post) return;
    
    try {
      // Update download count
      await (supabase as any)
        .from('posts')
        .update({ download_count: (post.download_count || 0) + 1 })
        .eq('id', post.id);

      // Extract filename from URL or use title
      const urlParts = post.file_url.split('/');
      const fileName = urlParts[urlParts.length - 1] || `${post.title.replace(/[^a-zA-Z0-9]/g, '_')}.${post.category === 'photo' ? 'jpg' : post.category === 'gif' ? 'gif' : post.category === 'video' ? 'mp4' : 'pdf'}`;
      
      // Fetch the file and download it
      const response = await fetch(post.file_url);
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Update local state
      setPost(prev => prev ? { ...prev, download_count: (prev.download_count || 0) + 1 } : null);
      
      toast({
        title: 'Download started',
        description: `Downloading ${fileName}`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Download failed',
        description: 'Could not download the file. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleShare = () => {
    if (!post) return;
    
    const url = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(url);
    toast({
      title: 'Link copied!',
      description: 'Share link has been copied to clipboard',
    });
  };

  const handleCopyPrompt = () => {
    if (!post?.prompt) return;
    
    navigator.clipboard.writeText(post.prompt);
    toast({
      title: 'Prompt copied!',
      description: 'The prompt has been copied to clipboard',
    });
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      gif: Film,
      video: Video,
      storybook: BookOpen,
      photo: ImageIcon,
    };
    return icons[category as keyof typeof icons] || ImageIcon;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Post not found</h1>
          <Button onClick={() => router.push('/gallery')}>
            Back to Gallery
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const CategoryIcon = getCategoryIcon(post.category);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-20 pb-12">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Media Display */}
            <Card className="overflow-hidden">
              <div className="relative aspect-video bg-muted">
                {post.file_url && (
                  <MediaDisplay
                    src={post.file_url}
                    alt={post.title}
                    category={post.category}
                    thumbnail={post.thumbnail_url || undefined}
                    className="w-full h-full"
                  />
                )}
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <LikeButton 
                postId={post.id}
                initialLikeCount={post.total_likes_count || 0}
              />
              
              <Button onClick={handleDownload} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Download ({post.download_count || 0})
              </Button>
              
              <Button onClick={handleShare} variant="outline" className="gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>

            {/* AI Generation Info */}
            {(post.ai_model || post.prompt) && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Wand2 className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">AI Generation Details</h3>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {post.ai_model && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Model Used</p>
                      <Badge variant="secondary" className="text-sm">
                        {post.ai_model}
                      </Badge>
                    </div>
                  )}
                  
                  {post.prompt && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-muted-foreground">Prompt</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCopyPrompt}
                          className="gap-2"
                        >
                          <Copy className="h-3 w-3" />
                          Copy
                        </Button>
                      </div>
                      <div className="relative">
                        <p className={`text-sm bg-muted p-3 rounded-lg ${!showPrompt && post.prompt.length > 200 ? 'line-clamp-3' : ''}`}>
                          {post.prompt}
                        </p>
                        {post.prompt.length > 200 && (
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => setShowPrompt(!showPrompt)}
                            className="mt-2"
                          >
                            {showPrompt ? 'Show less' : 'Show more'}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Comments Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">
                    Comments ({post.comments_count || 0})
                  </h3>
                </div>
              </CardHeader>
              <CardContent>
                <CommentSection postId={post.id} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Post Info */}
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-bold">{post.title}</h2>
                {post.description && (
                  <p className="text-muted-foreground mt-2">{post.description}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Creator */}
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={post.avatar_url || ''} />
                    <AvatarFallback>
                      {post.username?.slice(0, 2).toUpperCase() || 'AN'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{post.username || 'Anonymous'}</p>
                    <p className="text-sm text-muted-foreground">Creator</p>
                  </div>
                </div>

                <Separator />

                {/* Stats */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      <span className="text-sm">Views</span>
                    </div>
                    <span className="font-semibold">{post.view_count || 0}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CategoryIcon className="h-4 w-4" />
                      <span className="text-sm">Category</span>
                    </div>
                    <Badge>{post.category}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">Created</span>
                    </div>
                    <span className="text-sm">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>

                {/* Hashtags */}
                {post.hashtags && post.hashtags.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Tags</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {post.hashtags.map((tag) => (
                          <Link key={tag} href={`/gallery?tag=${tag}`}>
                            <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">
                              #{tag}
                            </Badge>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">More from {post.username || 'this creator'}</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {relatedPosts.map((relatedPost) => (
                      <Link 
                        key={relatedPost.id} 
                        href={`/post/${relatedPost.id}`}
                        className="block"
                      >
                        <div className="flex gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
                          {/* Thumbnail */}
                          <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                            {relatedPost.thumbnail_url || (relatedPost.category === 'photo' || relatedPost.category === 'gif') ? (
                              <img
                                src={relatedPost.thumbnail_url || relatedPost.file_url}
                                alt={relatedPost.title}
                                className="w-full h-full object-cover"
                              />
                            ) : relatedPost.category === 'video' && relatedPost.file_url ? (
                              <div className="relative w-full h-full">
                                <video
                                  src={relatedPost.file_url}
                                  className="w-full h-full object-cover"
                                  muted
                                  playsInline
                                  preload="metadata"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                  <Video className="h-4 w-4 text-white" />
                                </div>
                              </div>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                {React.createElement(getCategoryIcon(relatedPost.category), { className: 'h-6 w-6 text-muted-foreground' })}
                              </div>
                            )}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm line-clamp-1 hover:text-primary transition-colors">
                              {relatedPost.title}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(relatedPost.created_at), { addSuffix: true })}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Heart className="h-3 w-3" />
                                {relatedPost.total_likes_count || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {relatedPost.view_count || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  
                  {/* View All Link */}
                  <div className="mt-4 pt-4 border-t">
                    <Link 
                      href={`/gallery?user=${post.username}`}
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      View all posts from {post.username}
                      <ChevronLeft className="h-3 w-3 rotate-180" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}