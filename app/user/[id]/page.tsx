'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PostCard from '@/components/PostCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { PostWithMetrics } from '@/types/database';
import { 
  User, 
  Calendar, 
  Image as ImageIcon, 
  Film, 
  Video, 
  BookOpen,
  Heart,
  Eye,
  Download,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  email: string;
  created_at: string;
  bio?: string;
}

interface UserStats {
  total_posts: number;
  total_likes: number;
  total_views: number;
  total_downloads: number;
  posts_by_category: {
    photo: number;
    video: number;
    gif: number;
    storybook: number;
  };
}

export default function UserProfilePage() {
  const params = useParams();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<PostWithMetrics[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (params.id) {
      fetchUserData(params.id as string);
    }
  }, [params.id]);

  const fetchUserData = async (userId: string) => {
    try {
      setLoading(true);

      // Fetch user profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) throw userError;
      setUser(userData);

      // Fetch user's posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts_with_metrics')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;
      setPosts(postsData || []);

      // Calculate stats
      const stats: UserStats = {
        total_posts: postsData?.length || 0,
        total_likes: postsData?.reduce((sum, post) => sum + (post.total_likes_count || 0), 0) || 0,
        total_views: postsData?.reduce((sum, post) => sum + (post.view_count || 0), 0) || 0,
        total_downloads: postsData?.reduce((sum, post) => sum + (post.download_count || 0), 0) || 0,
        posts_by_category: {
          photo: postsData?.filter(p => p.category === 'photo').length || 0,
          video: postsData?.filter(p => p.category === 'video').length || 0,
          gif: postsData?.filter(p => p.category === 'gif').length || 0,
          storybook: postsData?.filter(p => p.category === 'storybook').length || 0,
        }
      };
      setStats(stats);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredPosts = () => {
    if (activeTab === 'all') return posts;
    return posts.filter(post => post.category === activeTab);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'photo': return <ImageIcon className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'gif': return <Film className="h-4 w-4" />;
      case 'storybook': return <BookOpen className="h-4 w-4" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-12 text-center">
          <h1 className="text-2xl font-bold mb-4">User not found</h1>
          <Link href="/">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* User Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatar_url || ''} alt={user.username} />
                <AvatarFallback>{user.username[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold">{user.username}</h1>
                  <Badge variant="secondary">
                    <User className="mr-1 h-3 w-3" />
                    Creator
                  </Badge>
                </div>
                
                {user.bio && (
                  <p className="text-muted-foreground mb-4">{user.bio}</p>
                )}
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.total_posts}</div>
                  <div className="text-sm text-muted-foreground">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold flex items-center justify-center gap-1">
                    <Heart className="h-5 w-5 text-red-500" />
                    {stats.total_likes}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Likes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold flex items-center justify-center gap-1">
                    <Eye className="h-5 w-5 text-blue-500" />
                    {stats.total_views}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Views</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold flex items-center justify-center gap-1">
                    <Download className="h-5 w-5 text-green-500" />
                    {stats.total_downloads}
                  </div>
                  <div className="text-sm text-muted-foreground">Downloads</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User's Posts */}
        <Card>
          <CardHeader>
            <CardTitle>Posts by {user.username}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-5 w-full max-w-xl">
                <TabsTrigger value="all">
                  All ({posts.length})
                </TabsTrigger>
                <TabsTrigger value="photo" className="flex items-center gap-1">
                  <ImageIcon className="h-3 w-3" />
                  {stats?.posts_by_category.photo || 0}
                </TabsTrigger>
                <TabsTrigger value="video" className="flex items-center gap-1">
                  <Video className="h-3 w-3" />
                  {stats?.posts_by_category.video || 0}
                </TabsTrigger>
                <TabsTrigger value="gif" className="flex items-center gap-1">
                  <Film className="h-3 w-3" />
                  {stats?.posts_by_category.gif || 0}
                </TabsTrigger>
                <TabsTrigger value="storybook" className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  {stats?.posts_by_category.storybook || 0}
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                {getFilteredPosts().length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getFilteredPosts().map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      No {activeTab === 'all' ? 'posts' : activeTab + 's'} yet
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}