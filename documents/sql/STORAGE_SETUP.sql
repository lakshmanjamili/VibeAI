-- ============================================
-- Supabase Storage Setup for AI Generations
-- ============================================
-- Run this in your Supabase SQL Editor

-- Create storage bucket for AI-generated content
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ai-generations',
  'ai-generations',
  true,
  524288000, -- 500MB max file size
  ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for ai-generations bucket

-- Policy 1: Allow authenticated users to upload their own generations
CREATE POLICY "Users can upload AI generations"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'ai-generations' AND
  (storage.foldername(name))[1] = 'generated'
);

-- Policy 2: Allow anyone to read AI generations (public bucket)
CREATE POLICY "Anyone can view AI generations"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'ai-generations');

-- Policy 3: Allow users to delete their own generations (optional - based on your needs)
CREATE POLICY "Users can delete their AI generations"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'ai-generations' AND
  (storage.foldername(name))[1] = 'generated'
);

-- Policy 4: Allow anonymous users to upload (since we support anonymous generations)
CREATE POLICY "Anonymous users can upload AI generations"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (
  bucket_id = 'ai-generations' AND
  (storage.foldername(name))[1] = 'generated'
);

-- Verify bucket creation
SELECT * FROM storage.buckets WHERE id = 'ai-generations';

-- Verify policies
SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%AI%';
