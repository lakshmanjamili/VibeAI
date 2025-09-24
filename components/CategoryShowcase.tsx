'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Film, Video, BookOpen, ImageIcon, ArrowRight, Eye } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { PostCategory } from '@/types/database';

export default function CategoryShowcase() {
  const [categoryData, setCategoryData] = useState<Record<PostCategory, any>>({
    gif: null,
    video: null,
    storybook: null,
    photo: null,
  });
  const [loading, setLoading] = useState(true);

  const categories = [
    { 
      value: 'gif' as PostCategory, 
      label: 'GIFs', 
      icon: Film, 
      color: 'from-purple-500 to-pink-500',
      description: 'Animated creativity in motion'
    },
    { 
      value: 'video' as PostCategory, 
      label: 'Videos', 
      icon: Video, 
      color: 'from-blue-500 to-cyan-500',
      description: 'Cinematic AI experiences'
    },
    { 
      value: 'storybook' as PostCategory, 
      label: 'Storybooks', 
      icon: BookOpen, 
      color: 'from-green-500 to-emerald-500',
      description: 'Narrative adventures'
    },
    { 
      value: 'photo' as PostCategory, 
      label: 'Photos', 
      icon: ImageIcon, 
      color: 'from-orange-500 to-red-500',
      description: 'Still moments of wonder'
    },
  ];

  useEffect(() => {
    fetchCategoryData();
  }, []);

  const fetchCategoryData = async () => {
    try {
      const categoryPromises = categories.map(async (cat) => {
        const { data, error } = await supabase
          .from('posts')
          .select(`
            *,
            users!inner(username, avatar_url),
            likes(count)
          `)
          .eq('category', cat.value)
          .order('view_count', { ascending: false })
          .limit(1)
          .single();

        if (error) return null;

        return {
          ...data,
          username: data.users?.username,
          avatar_url: data.users?.avatar_url,
          likes_count: data.likes?.[0]?.count || 0,
        };
      });

      const results = await Promise.all(categoryPromises);
      
      const newCategoryData: Record<PostCategory, any> = {
        gif: results[0],
        video: results[1],
        storybook: results[2],
        photo: results[3],
      };

      setCategoryData(newCategoryData);
    } catch (error) {
      console.error('Error fetching category data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">
          Explore by <span className="text-gradient">Category</span>
        </h2>
        <Link href="/gallery">
          <Button variant="outline" size="sm" className="gap-2">
            Browse All
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((category, index) => {
          const Icon = category.icon;
          const post = categoryData[category.value];

          return (
            <motion.div
              key={category.value}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-xl transition-all group">
                <div className={`h-2 bg-gradient-to-r ${category.color}`} />
                
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`rounded-lg p-2 bg-gradient-to-r ${category.color} bg-opacity-10`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <CardTitle className="text-lg">{category.label}</CardTitle>
                    </div>
                    <Link href={`/gallery?category=${category.value}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {category.description}
                  </p>
                </CardHeader>

                <CardContent>
                  {loading ? (
                    <div className="h-48 bg-muted animate-pulse rounded-lg" />
                  ) : post ? (
                    <Link href={`/post/${post.id}`}>
                      <div className="space-y-3">
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                          {post.thumbnail_url || post.file_url ? (
                            <Image
                              src={post.thumbnail_url || post.file_url}
                              alt={post.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Icon className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                          
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          
                          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                            <Badge variant="secondary" className="backdrop-blur-sm">
                              <Eye className="h-3 w-3 mr-1" />
                              {post.view_count}
                            </Badge>
                            <Badge variant="secondary" className="backdrop-blur-sm">
                              {post.likes_count} likes
                            </Badge>
                          </div>
                        </div>
                        
                        <div>
                          <p className="font-semibold truncate">{post.title}</p>
                          <p className="text-sm text-muted-foreground">
                            by {post.username}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <div className="h-48 rounded-lg border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center">
                      <Icon className="h-12 w-12 text-muted-foreground/30 mb-2" />
                      <p className="text-sm text-muted-foreground">No content yet</p>
                      <Link href="/upload">
                        <Button variant="link" size="sm" className="mt-2">
                          Be the first!
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}