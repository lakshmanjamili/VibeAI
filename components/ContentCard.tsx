'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Download, Eye, Film, Video, BookOpen, ImageIcon } from 'lucide-react';
import { Post } from '@/types/database';
import { motion } from 'framer-motion';

interface ContentCardProps {
  post: any; // Using any since we're using posts_with_metrics view
  onLike?: (postId: string) => void;
  onDownload?: (postId: string) => void;
}

export default function ContentCard({ post, onLike, onDownload }: ContentCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.total_likes_count || 0);

  const categoryIcons = {
    gif: Film,
    video: Video,
    storybook: BookOpen,
    photo: ImageIcon,
  };

  const CategoryIcon = categoryIcons[post.category as keyof typeof categoryIcons];

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    onLike?.(post.id);
  };

  const handleDownload = () => {
    onDownload?.(post.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
    >
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl">
        <Link href={`/post/${post.id}`}>
          <div className="relative aspect-square overflow-hidden bg-muted">
            {post.thumbnail_url || post.file_url ? (
              <Image
                src={post.thumbnail_url || post.file_url}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <CategoryIcon className="h-16 w-16 text-muted-foreground" />
              </div>
            )}

            <div className="absolute right-2 top-2">
              <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                <CategoryIcon className="mr-1 h-3 w-3" />
                {post.category}
              </Badge>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <div className="absolute bottom-0 left-0 right-0 translate-y-full p-4 transition-transform duration-300 group-hover:translate-y-0">
              <p className="truncate font-semibold text-white">{post.title}</p>
              {post.description && (
                <p className="truncate text-sm text-white/80">{post.description}</p>
              )}
            </div>
          </div>
        </Link>

        <div className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <Link
              href={`/user/${post.user_id}`}
              className="flex items-center space-x-2 transition-opacity hover:opacity-80"
            >
              {post.avatar_url && (
                <Image
                  src={post.avatar_url}
                  alt={post.username || 'User'}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              )}
              <span className="text-sm font-medium">{post.username || 'Anonymous'}</span>
            </Link>

            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <Eye className="h-3 w-3" />
              <span>{post.view_count}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`gap-1 ${isLiked ? 'text-red-500' : ''}`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likesCount}</span>
            </Button>

            <Button variant="ghost" size="sm" onClick={handleDownload} className="gap-1">
              <Download className="h-4 w-4" />
              <span>{post.download_count}</span>
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
