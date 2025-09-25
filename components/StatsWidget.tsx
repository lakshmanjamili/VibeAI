'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Image, Heart, Download, TrendingUp, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StatsWidget() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalUsers: 0,
    totalLikes: 0,
    totalDownloads: 0,
    todayPosts: 0,
    weeklyGrowth: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch total posts
      const { count: postsCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true });

      // Fetch total users
      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Fetch total likes
      const { count: likesCount } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true });

      // Fetch total downloads (sum of all download_count)
      const { data: downloadData } = await supabase
        .from('posts')
        .select('download_count');
      
      const totalDownloads = downloadData?.reduce((sum: number, post: any) => sum + (post.download_count || 0), 0) || 0;

      // Fetch today's posts
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: todayCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      // Calculate weekly growth (mock for now)
      const weeklyGrowth = 15; // This would be calculated from actual data

      setStats({
        totalPosts: postsCount || 0,
        totalUsers: usersCount || 0,
        totalLikes: likesCount || 0,
        totalDownloads: totalDownloads,
        todayPosts: todayCount || 0,
        weeklyGrowth,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const statCards = [
    {
      label: 'Total Posts',
      value: stats.totalPosts.toLocaleString(),
      icon: Image,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Active Creators',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Total Likes',
      value: stats.totalLikes.toLocaleString(),
      icon: Heart,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      label: 'Downloads',
      value: stats.totalDownloads.toLocaleString(),
      icon: Download,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: 'Today\'s Posts',
      value: stats.todayPosts.toLocaleString(),
      icon: Sparkles,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      label: 'Weekly Growth',
      value: `+${stats.weeklyGrowth}%`,
      icon: TrendingUp,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <Card className="hover:shadow-lg transition-all hover:scale-105">
            <CardContent className="p-4">
              <div className={`rounded-lg p-2 w-fit mb-3 ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}