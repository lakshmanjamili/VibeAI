'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Loader2, FileVideo, FileImage, FileText, Download, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaDisplayProps {
  src: string;
  alt?: string;
  category?: string;
  thumbnail?: string;
  className?: string;
  controls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
}

export default function MediaDisplay({
  src,
  alt = 'Media content',
  category,
  thumbnail,
  className,
  controls = true,
  autoPlay = false,
  loop = false,
  muted = false,
}: MediaDisplayProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'gif' | 'document' | 'unknown'>('unknown');

  // Detect media type from URL extension if category not provided
  const detectMediaType = (url: string): string => {
    const extension = url.split('.').pop()?.toLowerCase() || '';
    
    // Video formats
    const videoFormats = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'm4v', 'wmv', 'flv', '3gp', 'mpg', 'mpeg'];
    // Image formats
    const imageFormats = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'svg', 'bmp', 'ico', 'tiff', 'tif'];
    // GIF
    const gifFormats = ['gif'];
    // Document formats (for storybooks)
    const documentFormats = ['pdf'];
    
    if (videoFormats.includes(extension)) return 'video';
    if (imageFormats.includes(extension)) return 'image';
    if (gifFormats.includes(extension)) return 'gif';
    if (documentFormats.includes(extension)) return 'document';
    
    // Check by category if provided
    if (category) return category;
    
    // Default fallback based on common patterns
    if (url.includes('video') || url.includes('mp4')) return 'video';
    if (url.includes('image') || url.includes('photo')) return 'image';
    
    return 'image'; // Default to image
  };

  const type = category || detectMediaType(src);

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
    console.error(`Failed to load media: ${src}`);
  };

  // Handle PDF and document viewing
  if (type === 'document' || type === 'storybook') {
    return (
      <div className={cn('relative w-full h-full min-h-[500px] bg-muted', className)}>
        {src.toLowerCase().endsWith('.pdf') ? (
          <iframe
            src={src}
            className="w-full h-full min-h-[600px]"
            title={alt}
            onLoad={handleLoad}
            onError={handleError}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Document Preview</p>
            <a href={src} target="_blank" rel="noopener noreferrer">
              <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                <Download className="h-4 w-4" />
                Open Document
              </button>
            </a>
          </div>
        )}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}
      </div>
    );
  }

  // Handle video files
  if (type === 'video') {
    return (
      <div className={cn('relative w-full h-full', className)}>
        <video
          src={src}
          poster={thumbnail}
          controls={controls}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          className="w-full h-full object-contain bg-black"
          onLoadedData={handleLoad}
          onError={handleError}
          playsInline
        >
          {/* Fallback source options for better compatibility */}
          <source src={src} type="video/mp4" />
          <source src={src} type="video/webm" />
          <source src={src} type="video/ogg" />
          Your browser does not support the video tag.
        </video>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted">
            <FileVideo className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">Unable to load video</p>
            <a href={src} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Download video
            </a>
          </div>
        )}
      </div>
    );
  }

  // Handle GIF files
  if (type === 'gif') {
    return (
      <div className={cn('relative w-full h-full', className)}>
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-contain"
          onLoad={handleLoad}
          onError={handleError}
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted">
            <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Failed to load GIF</p>
          </div>
        )}
      </div>
    );
  }

  // Handle all image formats (default)
  return (
    <div className={cn('relative w-full h-full', className)}>
      {/* Try Next.js Image first for optimization */}
      {!error ? (
        <>
          {src.includes('http') && !src.includes('localhost') ? (
            <Image
              src={src}
              alt={alt}
              fill
              className="object-contain"
              onLoad={handleLoad}
              onError={() => {
                // Fallback to regular img tag if Next.js Image fails
                setError(true);
              }}
              unoptimized // Allow all image formats
              priority
            />
          ) : (
            <img
              src={src}
              alt={alt}
              className="w-full h-full object-contain"
              onLoad={handleLoad}
              onError={handleError}
            />
          )}
        </>
      ) : (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-contain"
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted">
          <FileImage className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">Unable to load image</p>
          <a href={src} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            Open in new tab
          </a>
        </div>
      )}
    </div>
  );
}