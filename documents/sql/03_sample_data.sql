-- Sample Data for Testing VibeAI Features
-- Run this in Supabase SQL editor to populate test data

-- Insert sample users (if not using Clerk auth)
INSERT INTO users (id, clerk_id, username, email, avatar_url, created_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'test_clerk_1', 'ArtistOne', 'artist1@example.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=1', NOW() - INTERVAL '30 days'),
  ('22222222-2222-2222-2222-222222222222', 'test_clerk_2', 'CreatorTwo', 'creator2@example.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=2', NOW() - INTERVAL '20 days'),
  ('33333333-3333-3333-3333-333333333333', 'test_clerk_3', 'VibeArtist', 'vibe@example.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=3', NOW() - INTERVAL '10 days')
ON CONFLICT (id) DO NOTHING;

-- Insert sample posts
INSERT INTO posts (id, user_id, title, description, category, file_url, thumbnail_url, hashtags, ai_model, prompt, view_count, download_count, comments_count, created_at)
VALUES
  -- Photos
  ('p1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 
   'Sunset Dreams', 'A beautiful AI-generated sunset landscape', 'photo',
   'https://images.unsplash.com/photo-1506905925346-21bda4d32df4', 
   'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
   ARRAY['sunset', 'landscape', 'nature', 'ai-art'], 'DALL-E 3', 
   'Create a breathtaking sunset over mountains with vibrant colors',
   150, 25, 0, NOW() - INTERVAL '6 days'),
   
  ('p2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222',
   'Cyber City', 'Futuristic cityscape at night', 'photo',
   'https://images.unsplash.com/photo-1518176366003-81e5c3f3a868',
   'https://images.unsplash.com/photo-1518176366003-81e5c3f3a868?w=400',
   ARRAY['cyberpunk', 'city', 'futuristic', 'neon'], 'Midjourney',
   'Cyberpunk city with neon lights and flying cars',
   320, 45, 0, NOW() - INTERVAL '5 days'),
   
  -- Videos
  ('p3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333',
   'Ocean Waves', 'Relaxing ocean waves animation', 'video',
   'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
   'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400',
   ARRAY['ocean', 'waves', 'relaxing', 'nature'], 'Runway ML',
   'Generate calming ocean waves with sunset lighting',
   89, 12, 0, NOW() - INTERVAL '4 days'),
   
  -- GIFs
  ('p4444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111',
   'Dancing Robot', 'Funny robot dance animation', 'gif',
   'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif',
   'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif',
   ARRAY['robot', 'dance', 'funny', 'animation'], 'Stable Diffusion',
   'Create a funny dancing robot animation',
   567, 89, 0, NOW() - INTERVAL '3 days'),
   
  -- Storybook
  ('p5555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222',
   'AI Adventure', 'Interactive AI storybook', 'storybook',
   'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
   'https://images.unsplash.com/photo-1532012197267-da84d26e5e0f?w=400',
   ARRAY['story', 'adventure', 'interactive', 'kids'], 'GPT-4',
   'Create an interactive adventure story for children',
   234, 56, 0, NOW() - INTERVAL '2 days'),
   
  -- More recent posts for testing
  ('p6666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333',
   'Abstract Art', 'Colorful abstract composition', 'photo',
   'https://images.unsplash.com/photo-1541701494587-cb58502866ab',
   'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400',
   ARRAY['abstract', 'colorful', 'art', 'modern'], 'DALL-E 3',
   'Generate abstract art with vibrant colors and flowing shapes',
   445, 67, 0, NOW() - INTERVAL '1 day'),
   
  ('p7777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111',
   'Space Journey', 'Journey through the cosmos', 'video',
   'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
   'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400',
   ARRAY['space', 'cosmos', 'stars', 'journey'], 'Pika Labs',
   'Create a cinematic journey through space',
   678, 123, 0, NOW() - INTERVAL '12 hours');

-- Insert sample likes (for testing like counts)
INSERT INTO likes (id, post_id, user_id, session_id, is_anonymous, created_at)
VALUES
  (gen_random_uuid(), 'p1111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', NULL, false, NOW() - INTERVAL '5 days'),
  (gen_random_uuid(), 'p1111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', NULL, false, NOW() - INTERVAL '4 days'),
  (gen_random_uuid(), 'p2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', NULL, false, NOW() - INTERVAL '4 days'),
  (gen_random_uuid(), 'p2222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', NULL, false, NOW() - INTERVAL '3 days'),
  (gen_random_uuid(), 'p3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', NULL, false, NOW() - INTERVAL '3 days'),
  (gen_random_uuid(), 'p4444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', NULL, false, NOW() - INTERVAL '2 days'),
  (gen_random_uuid(), 'p6666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', NULL, false, NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), 'p6666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', NULL, false, NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), 'p7777777-7777-7777-7777-777777777777', '22222222-2222-2222-2222-222222222222', NULL, false, NOW() - INTERVAL '6 hours'),
  -- Anonymous likes
  (gen_random_uuid(), 'p1111111-1111-1111-1111-111111111111', NULL, 'anon_session_001', true, NOW() - INTERVAL '3 days'),
  (gen_random_uuid(), 'p2222222-2222-2222-2222-222222222222', NULL, 'anon_session_002', true, NOW() - INTERVAL '2 days'),
  (gen_random_uuid(), 'p4444444-4444-4444-4444-444444444444', NULL, 'anon_session_003', true, NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), 'p6666666-6666-6666-6666-666666666666', NULL, 'anon_session_004', true, NOW() - INTERVAL '12 hours'),
  (gen_random_uuid(), 'p7777777-7777-7777-7777-777777777777', NULL, 'anon_session_005', true, NOW() - INTERVAL '3 hours')
ON CONFLICT DO NOTHING;

-- Insert sample comments
INSERT INTO comments (id, post_id, user_id, content, is_anonymous, anonymous_name, created_at)
VALUES
  (gen_random_uuid(), 'p1111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 
   'Amazing sunset! The colors are so vibrant!', false, NULL, NOW() - INTERVAL '4 days'),
  (gen_random_uuid(), 'p1111111-1111-1111-1111-111111111111', NULL, 
   'Beautiful work! How did you achieve this effect?', true, 'ArtLover', NOW() - INTERVAL '3 days'),
  (gen_random_uuid(), 'p2222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333',
   'Love the cyberpunk aesthetic!', false, NULL, NOW() - INTERVAL '3 days'),
  (gen_random_uuid(), 'p4444444-4444-4444-4444-444444444444', NULL,
   'Haha this is hilarious! 😄', true, 'Anonymous', NOW() - INTERVAL '2 days'),
  (gen_random_uuid(), 'p6666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111',
   'The colors blend so perfectly!', false, NULL, NOW() - INTERVAL '12 hours'),
  (gen_random_uuid(), 'p7777777-7777-7777-7777-777777777777', NULL,
   'This is mesmerizing to watch!', true, 'SpaceFan', NOW() - INTERVAL '2 hours')
ON CONFLICT DO NOTHING;

-- Update comments count for posts
UPDATE posts SET comments_count = (
  SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.id
);

-- Verify data insertion
SELECT 'Users:', COUNT(*) FROM users
UNION ALL
SELECT 'Posts:', COUNT(*) FROM posts
UNION ALL
SELECT 'Likes:', COUNT(*) FROM likes
UNION ALL
SELECT 'Comments:', COUNT(*) FROM comments;

-- Show sample of weekly best posts (last 7 days)
SELECT title, category, view_count, 
       (SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id) as like_count,
       created_at
FROM posts
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY (SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id) DESC
LIMIT 5;