'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, Upload, TrendingUp, Star, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface Activity {
  id: string;
  type: 'upload' | 'like' | 'trending';
  user: {
    username: string;
    avatar_url: string | null;
  };
  post: {
    id: string;
    title: string;
    category: string;
  };
  created_at: string;
}

export default function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivity();
    
    // Set up real-time subscription for new activities
    const channel = supabase
      .channel('activity-feed')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'posts' 
      }, handleNewPost)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'likes' 
      }, handleNewLike)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRecentActivity = async () => {
    try {
      // Fetch recent posts
      const { data: recentPosts } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          category,
          created_at,
          users!inner(username, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch recent likes
      const { data: recentLikes } = await supabase
        .from('likes')
        .select(`
          id,
          created_at,
          users!inner(username, avatar_url),
          posts!inner(id, title, category)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      // Combine and format activities
      const postActivities = (recentPosts || []).map((post: any) => ({
        id: `post-${post.id}`,
        type: 'upload' as const,
        user: {
          username: post.users.username,
          avatar_url: post.users.avatar_url,
        },
        post: {
          id: post.id,
          title: post.title,
          category: post.category,
        },
        created_at: post.created_at,
      }));

      const likeActivities = (recentLikes || []).map((like: any) => ({
        id: `like-${like.id}`,
        type: 'like' as const,
        user: {
          username: like.users.username,
          avatar_url: like.users.avatar_url,
        },
        post: {
          id: like.posts.id,
          title: like.posts.title,
          category: like.posts.category,
        },
        created_at: like.created_at,
      }));

      // Combine and sort by date
      const allActivities = [...postActivities, ...likeActivities]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);

      setActivities(allActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewPost = (payload: any) => {
    // Add new post activity to the feed
    const newActivity: Activity = {
      id: `post-${payload.new.id}`,
      type: 'upload',
      user: {
        username: 'New User', // Would need to fetch user data
        avatar_url: null,
      },
      post: {
        id: payload.new.id,
        title: payload.new.title,
        category: payload.new.category,
      },
      created_at: payload.new.created_at,
    };

    setActivities(prev => [newActivity, ...prev].slice(0, 10));
  };

  const handleNewLike = (payload: any) => {
    // Add new like activity to the feed
    // Would need to fetch additional data for complete activity
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'upload':
        return <Upload className="h-4 w-4" />;
      case 'like':
        return <Heart className="h-4 w-4" />;
      case 'trending':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'upload':
        return 'text-blue-500';
      case 'like':
        return 'text-red-500';
      case 'trending':
        return 'text-orange-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const getActivityText = (activity: Activity) => {
    switch (activity.type) {
      case 'upload':
        return (
          <>
            <span className="font-semibold">{activity.user.username}</span>
            {' uploaded '}
            <span className="font-medium">{activity.post.title}</span>
          </>
        );
      case 'like':
        return (
          <>
            <span className="font-semibold">{activity.user.username}</span>
            {' liked '}
            <span className="font-medium">{activity.post.title}</span>
          </>
        );
      case 'trending':
        return (
          <>
            <span className="font-medium">{activity.post.title}</span>
            {' is trending'}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <CardTitle>Live Activity</CardTitle>
          </div>
          <Badge variant="secondary" className="animate-pulse">
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : activities.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No recent activity
            </p>
          ) : (
            <AnimatePresence>
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={activity.user.avatar_url || ''} />
                      <AvatarFallback>
                        {activity.user.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <div className={`mt-1 ${getActivityColor(activity.type)}`}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm leading-relaxed">
                            {getActivityText(activity)}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {activity.post.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}