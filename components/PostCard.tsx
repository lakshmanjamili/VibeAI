'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PostWithMetrics } from '@/types/database';
import {
  Heart,
  Eye,
  Download,
  MessageCircle,
  Film,
  Video,
  BookOpen,
  ImageIcon,
  Sparkles,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

interface PostCardProps {
  post: PostWithMetrics;
  index?: number;
}

export default function PostCard({ post, index = 0 }: PostCardProps) {
  const getCategoryIcon = () => {
    switch (post.category) {
      case 'photo':
        return <ImageIcon className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'gif':
        return <Film className="h-4 w-4" />;
      case 'storybook':
        return <BookOpen className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getCategoryColor = () => {
    switch (post.category) {
      case 'photo':
        return 'bg-blue-500/10 text-blue-500';
      case 'video':
        return 'bg-purple-500/10 text-purple-500';
      case 'gif':
        return 'bg-green-500/10 text-green-500';
      case 'storybook':
        return 'bg-orange-500/10 text-orange-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getThumbnail = () => {
    // Always try to use thumbnail_url first if available
    if (post.thumbnail_url) {
      return post.thumbnail_url;
    }

    // For photos and GIFs, use the file URL directly
    if (post.category === 'photo' || post.category === 'gif') {
      return post.file_url;
    }

    // For videos and storybooks, return null to show icon placeholder
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link href={`/post/${post.id}`}>
        <Card className="h-full overflow-hidden transition-shadow duration-300 hover:shadow-lg">
          {/* Thumbnail */}
          <div className="relative aspect-square overflow-hidden bg-secondary">
            {getThumbnail() ? (
              <img
                src={getThumbnail()!}
                alt={post.title}
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              />
            ) : post.category === 'video' && post.file_url ? (
              // For videos without thumbnails, show video element with first frame
              <div className="relative h-full w-full">
                <video
                  src={post.file_url}
                  className="h-full w-full object-cover"
                  muted
                  playsInline
                  preload="metadata"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="rounded-full bg-white/90 p-3">
                    <Video className="h-8 w-8 text-black" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                {getCategoryIcon()}
              </div>
            )}

            {/* Category Badge */}
            <div className="absolute left-2 top-2">
              <Badge className={`${getCategoryColor()} gap-1`}>
                {getCategoryIcon()}
                {post.category}
              </Badge>
            </div>

            {/* AI Badge */}
            {post.ai_model && (
              <div className="absolute right-2 top-2">
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  AI
                </Badge>
              </div>
            )}

            {/* Stats Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
              <div className="flex items-center gap-3 text-sm text-white">
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3 fill-current" />
                  {post.total_likes_count || 0}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {post.view_count || 0}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" />
                  {post.comments_count || 0}
                </span>
                {post.download_count > 0 && (
                  <span className="flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    {post.download_count}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <CardHeader className="pb-3">
            <h3 className="line-clamp-2 font-semibold transition-colors hover:text-primary">
              {post.title}
            </h3>
            {post.description && (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{post.description}</p>
            )}
          </CardHeader>

          {/* Footer */}
          <CardFooter className="pt-0">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={post.avatar_url || ''} />
                  <AvatarFallback>{post.username?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">{post.username}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </span>
            </div>
          </CardFooter>

          {/* Hashtags */}
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="px-6 pb-4">
              <div className="flex flex-wrap gap-1">
                {post.hashtags.slice(0, 3).map((tag, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
                {post.hashtags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{post.hashtags.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </Card>
      </Link>
    </motion.div>
  );
}
