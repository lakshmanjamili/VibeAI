'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import {
  Grid3x3,
  Eye,
  Heart,
  MessageCircle,
  Video,
  Loader2,
  ChevronRight,
  Calendar,
  MapPin,
  Link as LinkIcon,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  created_at: string;
}

interface UserStats {
  totalPosts: number;
  totalViews: number;
  totalLikes: number;
}

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const { userId: currentUserId } = useAuth();
  const userId = params.userId as string;

  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats>({ totalPosts: 0, totalViews: 0, totalLikes: 0 });
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [hasMorePosts, setHasMorePosts] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  // Check if viewing own profile
  const isOwnProfile = currentUserId && user?.clerk_id === currentUserId;

  // Fetch user profile
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) throw error;

        setUser(data);
      } catch (error) {
        console.error('Error fetching user:', error);
        toast({
          title: 'Error',
          description: 'Failed to load user profile',
          variant: 'destructive'
        });
      } finally {
        setLoadingUser(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  // Fetch user posts
  const fetchUserPosts = async () => {
    setLoadingPosts(true);
    try {
      const params = new URLSearchParams({
        limit: '20',
        offset: '0',
        category: filterCategory,
        sortBy: sortBy,
        order: 'desc'
      });

      const response = await fetch(`/api/user/${userId}/posts?${params}`);
      const data = await response.json();

      if (response.ok) {
        setUserPosts(data.posts || []);
        setHasMorePosts(data.pagination?.hasMore || false);

        // Calculate stats
        const posts = data.posts || [];
        const totalPosts = data.pagination?.total || 0;
        const totalViews = posts.reduce((sum: number, post: any) => sum + (post.view_count || 0), 0);
        const totalLikes = posts.reduce((sum: number, post: any) => sum + (post.likes_count || 0), 0);

        setStats({ totalPosts, totalViews, totalLikes });
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to load posts',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Failed to fetch user posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load posts',
        variant: 'destructive'
      });
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserPosts();
    }
  }, [userId, filterCategory, sortBy]);

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950/30 dark:via-slate-900 dark:to-blue-950/30">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950/30 dark:via-slate-900 dark:to-blue-950/30">
        <Navbar />
        <div className="container mx-auto px-4 pt-20 pb-12">
          <Card className="max-w-md mx-auto mt-20">
            <CardContent className="p-12 text-center">
              <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
              <p className="text-muted-foreground mb-6">
                The user you're looking for doesn't exist.
              </p>
              <Button onClick={() => router.push('/')}>
                Go Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950/30 dark:via-slate-900 dark:to-blue-950/30">
      <Navbar />

      <main className="container mx-auto px-4 pt-20 pb-12 max-w-6xl">
        {/* Profile Header - Instagram Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <Card>
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                {/* Avatar */}
                <Avatar className="h-32 w-32 border-4 border-primary/20">
                  <AvatarImage src={user.avatar_url || undefined} />
                  <AvatarFallback className="text-4xl bg-gradient-to-br from-primary to-purple-600 text-white">
                    {user.username?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>

                {/* User Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <h1 className="text-3xl font-bold">{user.username}</h1>
                    {isOwnProfile && (
                      <Button variant="outline" size="sm" onClick={() => router.push('/settings')}>
                        Edit Profile
                      </Button>
                    )}
                  </div>

                  {/* Stats - Instagram Style */}
                  <div className="flex gap-8 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{stats.totalPosts}</div>
                      <div className="text-sm text-muted-foreground">posts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">views</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{stats.totalLikes.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">likes</div>
                    </div>
                  </div>

                  {/* Bio */}
                  {user.bio && (
                    <p className="text-muted-foreground mb-4">{user.bio}</p>
                  )}

                  {/* Additional Info */}
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {user.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{user.location}</span>
                      </div>
                    )}
                    {user.website && (
                      <a
                        href={user.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                      >
                        <LinkIcon className="h-4 w-4" />
                        <span>{user.website}</span>
                      </a>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <Grid3x3 className="h-4 w-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Stats
            </TabsTrigger>
          </TabsList>

          {/* Posts Tab */}
          <TabsContent value="posts">
            <Card>
              <CardContent className="p-6">
                {/* Filters and Sorting */}
                <div className="flex flex-wrap gap-4 mb-6 p-4 border rounded-lg bg-muted/30">
                  <div className="flex-1 min-w-[200px]">
                    <Label className="text-xs mb-2 block">Filter by Category</Label>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="photo">📷 Photos</SelectItem>
                        <SelectItem value="video">🎬 Videos</SelectItem>
                        <SelectItem value="gif">🎞️ GIFs</SelectItem>
                        <SelectItem value="storybook">📚 Storybooks</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1 min-w-[200px]">
                    <Label className="text-xs mb-2 block">Sort By</Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="created_at">📅 Latest First</SelectItem>
                        <SelectItem value="view_count">👀 Most Viewed</SelectItem>
                        <SelectItem value="likes_count">❤️ Most Liked</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Loading State */}
                {loadingPosts ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : userPosts.length === 0 ? (
                  /* Empty State */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-20"
                  >
                    <div className="bg-primary/5 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                      <Grid3x3 className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
                    <p className="text-muted-foreground">
                      {isOwnProfile ? "Start creating and sharing your content" : "This user hasn't posted anything yet"}
                    </p>
                  </motion.div>
                ) : (
                  /* Instagram-like Grid */
                  <div>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4"
                    >
                      {userPosts.map((post, index) => (
                        <motion.div
                          key={post.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.02 }}
                          className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer"
                          onClick={() => router.push(`/post/${post.id}`)}
                        >
                          {/* Image/Video */}
                          {post.category === 'video' ? (
                            <div className="relative w-full h-full">
                              <video
                                src={post.file_url}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                <Video className="h-12 w-12 text-white" />
                              </div>
                            </div>
                          ) : (
                            <img
                              src={post.thumbnail_url || post.file_url}
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          )}

                          {/* Overlay on Hover */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                              <h4 className="font-semibold text-sm line-clamp-1 mb-2">{post.title}</h4>
                              <div className="flex items-center gap-4 text-xs">
                                <div className="flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  <span>{post.view_count || 0}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Heart className="h-3 w-3" />
                                  <span>{post.likes_count || 0}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MessageCircle className="h-3 w-3" />
                                  <span>{post.comments_count || 0}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Category Badge */}
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="text-[10px] capitalize bg-black/50 text-white border-none">
                              {post.category}
                            </Badge>
                          </div>

                          {/* AI Model Badge if applicable */}
                          {post.ai_model && (
                            <div className="absolute top-2 left-2">
                              <Badge className="text-[10px] bg-primary/80 border-none">
                                AI: {post.ai_model}
                              </Badge>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </motion.div>

                    {/* Load More Button */}
                    {hasMorePosts && (
                      <div className="text-center mt-8">
                        <Button
                          variant="outline"
                          onClick={fetchUserPosts}
                          disabled={loadingPosts}
                        >
                          {loadingPosts ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            <>
                              Load More
                              <ChevronRight className="h-4 w-4 ml-2" />
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats">
            <Card>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-center p-6 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20"
                  >
                    <Grid3x3 className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                    <div className="text-4xl font-bold mb-2">{stats.totalPosts}</div>
                    <div className="text-muted-foreground">Total Posts</div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center p-6 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20"
                  >
                    <Eye className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                    <div className="text-4xl font-bold mb-2">{stats.totalViews.toLocaleString()}</div>
                    <div className="text-muted-foreground">Total Views</div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center p-6 rounded-lg bg-gradient-to-br from-red-500/10 to-pink-500/10 border border-red-500/20"
                  >
                    <Heart className="h-12 w-12 mx-auto mb-4 text-red-500" />
                    <div className="text-4xl font-bold mb-2">{stats.totalLikes.toLocaleString()}</div>
                    <div className="text-muted-foreground">Total Likes</div>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
