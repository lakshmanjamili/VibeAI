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
  Sparkles
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
      case 'photo': return <ImageIcon className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'gif': return <Film className="h-4 w-4" />;
      case 'storybook': return <BookOpen className="h-4 w-4" />;
      default: return null;
    }
  };

  const getCategoryColor = () => {
    switch (post.category) {
      case 'photo': return 'bg-blue-500/10 text-blue-500';
      case 'video': return 'bg-purple-500/10 text-purple-500';
      case 'gif': return 'bg-green-500/10 text-green-500';
      case 'storybook': return 'bg-orange-500/10 text-orange-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getThumbnail = () => {
    // For videos and storybooks without thumbnails, show a placeholder
    if (!post.thumbnail_url && (post.category === 'video' || post.category === 'storybook')) {
      return null;
    }
    return post.thumbnail_url || post.file_url;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link href={`/post/${post.id}`}>
        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full">
          {/* Thumbnail */}
          <div className="aspect-square relative overflow-hidden bg-secondary">
            {getThumbnail() ? (
              <img
                src={getThumbnail()!}
                alt={post.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {getCategoryIcon()}
              </div>
            )}
            
            {/* Category Badge */}
            <div className="absolute top-2 left-2">
              <Badge className={`${getCategoryColor()} gap-1`}>
                {getCategoryIcon()}
                {post.category}
              </Badge>
            </div>

            {/* AI Badge */}
            {post.ai_model && (
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  AI
                </Badge>
              </div>
            )}

            {/* Stats Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
              <div className="flex items-center gap-3 text-white text-sm">
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
            <h3 className="font-semibold line-clamp-2 hover:text-primary transition-colors">
              {post.title}
            </h3>
            {post.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {post.description}
              </p>
            )}
          </CardHeader>

          {/* Footer */}
          <CardFooter className="pt-0">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={post.avatar_url || ''} />
                  <AvatarFallback>{post.username?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">
                  {post.username}
                </span>
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