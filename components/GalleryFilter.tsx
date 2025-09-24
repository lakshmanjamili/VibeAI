'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Film, Video, BookOpen, ImageIcon, Sparkles, TrendingUp, Clock, Heart } from 'lucide-react';
import { PostCategory } from '@/types/database';

interface GalleryFilterProps {
  onCategoryChange: (category: PostCategory | 'all') => void;
  onSortChange: (sort: 'latest' | 'popular' | 'trending') => void;
}

export default function GalleryFilter({ onCategoryChange, onSortChange }: GalleryFilterProps) {
  const [selectedCategory, setSelectedCategory] = useState<PostCategory | 'all'>('all');
  const [selectedSort, setSelectedSort] = useState<'latest' | 'popular' | 'trending'>('latest');

  const categories = [
    { value: 'all', label: 'All', icon: Sparkles },
    { value: 'gif', label: 'GIFs', icon: Film },
    { value: 'video', label: 'Videos', icon: Video },
    { value: 'storybook', label: 'Storybooks', icon: BookOpen },
    { value: 'photo', label: 'Photos', icon: ImageIcon },
  ];

  const handleCategoryChange = (category: PostCategory | 'all') => {
    setSelectedCategory(category);
    onCategoryChange(category);
  };

  const handleSortChange = (sort: string) => {
    const sortValue = sort as 'latest' | 'popular' | 'trending';
    setSelectedSort(sortValue);
    onSortChange(sortValue);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card rounded-lg border">
      <div className="flex flex-wrap gap-2 flex-1">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Button
              key={category.value}
              variant={selectedCategory === category.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryChange(category.value as PostCategory | 'all')}
              className="gap-2"
            >
              <Icon className="h-4 w-4" />
              {category.label}
            </Button>
          );
        })}
      </div>
      
      <Select value={selectedSort} onValueChange={handleSortChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="latest">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Latest
            </div>
          </SelectItem>
          <SelectItem value="popular">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Most Liked
            </div>
          </SelectItem>
          <SelectItem value="trending">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Trending
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}