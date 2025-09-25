'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Star, Zap, Crown, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Creator {
  id: string;
  username: string;
  avatar_url: string | null;
  post_count: number;
  total_likes: number;
  total_views: number;
  rank?: number;
}

export default function CreatorSpotlight() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopCreators();
  }, []);

  const fetchTopCreators = async () => {
    try {
      // Fetch users with their stats
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .limit(10);

      if (userError) throw userError;

      // For each user, fetch their stats
      const creatorsWithStats = await Promise.all(
        (userData || []).map(async (user: any) => {
          // Get post count
          const { count: postCount } = await supabase
            .from('posts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

          // Get total likes
          const { data: posts } = await supabase
            .from('posts')
            .select('id')
            .eq('user_id', user.id);

          let totalLikes = 0;
          let totalViews = 0;

          if (posts && posts.length > 0) {
            const postIds = posts.map((p: any) => p.id);
            
            // Get likes count
            const { count: likesCount } = await supabase
              .from('likes')
              .select('*', { count: 'exact', head: true })
              .in('post_id', postIds);

            totalLikes = likesCount || 0;

            // Get total views
            const { data: viewData } = await supabase
              .from('posts')
              .select('view_count')
              .eq('user_id', user.id);

            totalViews = viewData?.reduce((sum: number, post: any) => sum + (post.view_count || 0), 0) || 0;
          }

          return {
            id: user.id,
            username: user.username,
            avatar_url: user.avatar_url,
            post_count: postCount || 0,
            total_likes: totalLikes,
            total_views: totalViews,
          };
        })
      );

      // Sort by total likes and assign ranks
      const sortedCreators = creatorsWithStats
        .sort((a, b) => b.total_likes - a.total_likes)
        .slice(0, 5)
        .map((creator, index) => ({
          ...creator,
          rank: index + 1,
        }));

      setCreators(sortedCreators);
    } catch (error) {
      console.error('Error fetching creators:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Star className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Zap className="h-5 w-5 text-orange-600" />;
      default:
        return <Trophy className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getRankBadge = (rank: number) => {
    const colors = [
      'bg-gradient-to-r from-yellow-400 to-yellow-600',
      'bg-gradient-to-r from-gray-300 to-gray-500',
      'bg-gradient-to-r from-orange-400 to-orange-600',
      'bg-muted',
      'bg-muted',
    ];
    return colors[rank - 1] || 'bg-muted';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <CardTitle>Creator Spotlight</CardTitle>
          </div>
          <Link href="/creators">
            <Button variant="ghost" size="sm" className="gap-2">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : creators.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No creators yet. Be the first!
          </p>
        ) : (
          <div className="space-y-4">
            {creators.map((creator, index) => (
              <motion.div
                key={creator.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link href={`/user/${creator.id}`}>
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group">
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={creator.avatar_url || ''} />
                        <AvatarFallback>
                          {creator.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {creator.rank && creator.rank <= 3 && (
                        <div className={`absolute -top-1 -right-1 rounded-full p-1 ${getRankBadge(creator.rank)}`}>
                          {getRankIcon(creator.rank)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold group-hover:text-primary transition-colors">
                          {creator.username}
                        </p>
                        {creator.rank === 1 && (
                          <Badge variant="secondary" className="text-xs">
                            Top Creator
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{creator.post_count} posts</span>
                        <span>•</span>
                        <span>{creator.total_likes} likes</span>
                        <span>•</span>
                        <span>{creator.total_views} views</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-muted-foreground">
                        #{creator.rank}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}