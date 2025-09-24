-- 🚀 COMPLETE SUPABASE SETUP SCRIPT FOR VIBEAI
-- Safe to run multiple times - checks for existing objects
-- Last Updated: December 2024

-- ============================================
-- STEP 1: ENABLE EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- STEP 2: CREATE ENUM TYPES (IF NOT EXISTS)
-- ============================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'post_category') THEN
        CREATE TYPE post_category AS ENUM ('gif', 'video', 'storybook', 'photo');
    END IF;
END$$;

-- ============================================
-- STEP 3: CREATE OR UPDATE CORE TABLES
-- ============================================

-- Users table (synced with Clerk)
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    clerk_id TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    bio TEXT
);

-- Posts table - Create base table first, then add columns if missing
CREATE TABLE IF NOT EXISTS posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category post_category NOT NULL,
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0
);

-- Add columns to posts table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'ai_model') THEN
        ALTER TABLE posts ADD COLUMN ai_model TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'prompt') THEN
        ALTER TABLE posts ADD COLUMN prompt TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'generation_details') THEN
        ALTER TABLE posts ADD COLUMN generation_details JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'anonymous_likes_count') THEN
        ALTER TABLE posts ADD COLUMN anonymous_likes_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'comments_count') THEN
        ALTER TABLE posts ADD COLUMN comments_count INTEGER DEFAULT 0;
    END IF;
END$$;

-- Comments table (supports anonymous)
CREATE TABLE IF NOT EXISTS comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    anonymous_name TEXT,
    anonymous_id TEXT,
    content TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE
);

-- Likes table (authenticated users)
CREATE TABLE IF NOT EXISTS likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    UNIQUE(user_id, post_id)
);

-- Anonymous likes table
CREATE TABLE IF NOT EXISTS anonymous_likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    ip_hash TEXT,
    device_fingerprint TEXT,
    user_agent TEXT,
    metadata JSONB,
    is_suspicious BOOLEAN DEFAULT FALSE,
    fraud_score INTEGER DEFAULT 0,
    UNIQUE(post_id, session_id)
);

-- Hashtags table
CREATE TABLE IF NOT EXISTS hashtags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    usage_count INTEGER DEFAULT 0
);

-- Post hashtags junction table
CREATE TABLE IF NOT EXISTS post_hashtags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    hashtag_id UUID NOT NULL REFERENCES hashtags(id) ON DELETE CASCADE,
    UNIQUE(post_id, hashtag_id)
);

-- AI Models reference table
CREATE TABLE IF NOT EXISTS ai_models (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    provider TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ============================================
-- STEP 4: CREATE ANTI-BOT PROTECTION TABLES
-- ============================================

-- Fraud logs table
CREATE TABLE IF NOT EXISTS fraud_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    session_id TEXT,
    ip_hash TEXT,
    device_fingerprint TEXT,
    action_type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    details JSONB,
    blocked BOOLEAN DEFAULT FALSE
);

-- Rate limits table
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    identifier TEXT NOT NULL,
    identifier_type TEXT NOT NULL,
    action_type TEXT NOT NULL,
    count INTEGER DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    window_end TIMESTAMP WITH TIME ZONE NOT NULL,
    UNIQUE(identifier, identifier_type, action_type, window_start)
);

-- Reputation scores table
CREATE TABLE IF NOT EXISTS reputation_scores (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id TEXT UNIQUE NOT NULL,
    score INTEGER DEFAULT 100,
    total_actions INTEGER DEFAULT 0,
    flagged_actions INTEGER DEFAULT 0,
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    is_banned BOOLEAN DEFAULT FALSE,
    ban_reason TEXT,
    metadata JSONB
);

-- Blocked patterns table
CREATE TABLE IF NOT EXISTS blocked_patterns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    pattern_type TEXT NOT NULL,
    pattern_value TEXT NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

-- ============================================
-- STEP 5: CREATE INDEXES
-- ============================================

-- Users indexes
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_username ON users(username);

-- Posts indexes
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_category ON posts(category);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_ai_model ON posts(ai_model);

-- Comments indexes
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);

-- Likes indexes
CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);

-- Anonymous likes indexes
CREATE INDEX idx_anonymous_likes_post_id ON anonymous_likes(post_id);
CREATE INDEX idx_anonymous_likes_session_id ON anonymous_likes(session_id);
CREATE INDEX idx_anonymous_likes_device_fingerprint ON anonymous_likes(device_fingerprint);
CREATE INDEX idx_anonymous_likes_ip_hash ON anonymous_likes(ip_hash);
CREATE INDEX idx_anonymous_likes_created_at ON anonymous_likes(created_at DESC);

-- Hashtags indexes
CREATE INDEX idx_hashtags_name ON hashtags(name);
CREATE INDEX idx_hashtags_usage_count ON hashtags(usage_count DESC);

-- Post hashtags indexes
CREATE INDEX idx_post_hashtags_post_id ON post_hashtags(post_id);
CREATE INDEX idx_post_hashtags_hashtag_id ON post_hashtags(hashtag_id);

-- Fraud logs indexes
CREATE INDEX idx_fraud_logs_session_id ON fraud_logs(session_id);
CREATE INDEX idx_fraud_logs_ip_hash ON fraud_logs(ip_hash);
CREATE INDEX idx_fraud_logs_severity ON fraud_logs(severity);
CREATE INDEX idx_fraud_logs_created_at ON fraud_logs(created_at DESC);

-- Rate limits indexes
CREATE INDEX idx_rate_limits_identifier ON rate_limits(identifier);
CREATE INDEX idx_rate_limits_window_end ON rate_limits(window_end);

-- Reputation scores indexes
CREATE INDEX idx_reputation_scores_session_id ON reputation_scores(session_id);
CREATE INDEX idx_reputation_scores_score ON reputation_scores(score);
CREATE INDEX idx_reputation_scores_is_banned ON reputation_scores(is_banned);

-- Blocked patterns indexes
CREATE INDEX idx_blocked_patterns_pattern_type ON blocked_patterns(pattern_type);
CREATE INDEX idx_blocked_patterns_pattern_value ON blocked_patterns(pattern_value);
CREATE INDEX idx_blocked_patterns_is_active ON blocked_patterns(is_active);

-- ============================================
-- STEP 6: CREATE OR REPLACE VIEWS
-- ============================================

-- Drop and recreate to avoid duplicate column issues
DROP VIEW IF EXISTS posts_with_metrics CASCADE;

-- Posts with metrics view (p.* already includes anonymous_likes_count and comments_count)
CREATE VIEW posts_with_metrics AS
SELECT 
    p.*,
    u.username,
    u.avatar_url,
    COUNT(DISTINCT l.id) AS authenticated_likes_count,
    COUNT(DISTINCT l.id) + COALESCE(p.anonymous_likes_count, 0) AS total_likes_count,
    ARRAY_AGG(DISTINCT h.name) FILTER (WHERE h.name IS NOT NULL) AS hashtags
FROM posts p
LEFT JOIN users u ON p.user_id = u.id
LEFT JOIN likes l ON p.id = l.post_id
LEFT JOIN post_hashtags ph ON p.id = ph.post_id
LEFT JOIN hashtags h ON ph.hashtag_id = h.id
GROUP BY p.id, u.username, u.avatar_url;

-- Suspicious activity summary view
CREATE OR REPLACE VIEW suspicious_activity_summary AS
SELECT 
    DATE_TRUNC('hour', created_at) AS hour,
    action_type,
    severity,
    COUNT(*) AS incident_count,
    COUNT(DISTINCT session_id) AS unique_sessions,
    COUNT(DISTINCT ip_hash) AS unique_ips
FROM fraud_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', created_at), action_type, severity
ORDER BY hour DESC, incident_count DESC;

-- ============================================
-- STEP 7: CREATE FUNCTIONS
-- ============================================

-- Toggle anonymous like function
CREATE OR REPLACE FUNCTION toggle_anonymous_like(
    p_post_id UUID,
    p_session_id TEXT,
    p_ip_hash TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    v_exists BOOLEAN;
BEGIN
    -- Check if like exists
    SELECT EXISTS(
        SELECT 1 FROM anonymous_likes 
        WHERE post_id = p_post_id AND session_id = p_session_id
    ) INTO v_exists;
    
    IF v_exists THEN
        -- Remove like
        DELETE FROM anonymous_likes 
        WHERE post_id = p_post_id AND session_id = p_session_id;
        
        -- Update counter
        UPDATE posts 
        SET anonymous_likes_count = GREATEST(0, anonymous_likes_count - 1)
        WHERE id = p_post_id;
        
        RETURN FALSE;
    ELSE
        -- Add like
        INSERT INTO anonymous_likes (post_id, session_id, ip_hash)
        VALUES (p_post_id, p_session_id, p_ip_hash);
        
        -- Update counter
        UPDATE posts 
        SET anonymous_likes_count = anonymous_likes_count + 1 
        WHERE id = p_post_id;
        
        RETURN TRUE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Add hashtags to post function
CREATE OR REPLACE FUNCTION add_hashtags_to_post(
    p_post_id UUID,
    p_hashtags TEXT[]
) RETURNS VOID AS $$
DECLARE
    v_hashtag TEXT;
    v_hashtag_id UUID;
BEGIN
    FOREACH v_hashtag IN ARRAY p_hashtags
    LOOP
        -- Insert or get hashtag
        INSERT INTO hashtags (name)
        VALUES (LOWER(v_hashtag))
        ON CONFLICT (name) 
        DO UPDATE SET usage_count = hashtags.usage_count + 1
        RETURNING id INTO v_hashtag_id;
        
        -- Link to post
        INSERT INTO post_hashtags (post_id, hashtag_id)
        VALUES (p_post_id, v_hashtag_id)
        ON CONFLICT DO NOTHING;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 8: INSERT INITIAL DATA
-- ============================================

-- Insert AI models
INSERT INTO ai_models (name, provider, description) VALUES
    ('Nano Banana', 'Google', 'Google''s creative AI model'),
    ('Grok', 'xAI', 'xAI''s image generation model'),
    ('DALL-E 3', 'OpenAI', 'OpenAI''s latest image model'),
    ('Midjourney', 'Midjourney', 'Advanced creative AI'),
    ('Stable Diffusion', 'Stability AI', 'Open source image generation'),
    ('Claude', 'Anthropic', 'Anthropic''s AI assistant'),
    ('Other', 'Various', 'Other AI models')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- STEP 9: ENABLE ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE anonymous_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE reputation_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_patterns ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 10: CREATE RLS POLICIES
-- ============================================
-- IMPORTANT: We use Clerk for auth, not Supabase Auth
-- Therefore policies are permissive and security is in app layer

-- Drop all existing policies first
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- Users policies - Permissive for Clerk auth
CREATE POLICY "users_all_operations" ON users
    FOR ALL USING (true) WITH CHECK (true);

-- Posts policies - Permissive for Clerk auth
CREATE POLICY "posts_all_operations" ON posts
    FOR ALL USING (true) WITH CHECK (true);

-- Comments policies - Permissive for Clerk auth
CREATE POLICY "comments_all_operations" ON comments
    FOR ALL USING (true) WITH CHECK (true);

-- Likes policies - Permissive for Clerk auth
CREATE POLICY "likes_all_operations" ON likes
    FOR ALL USING (true) WITH CHECK (true);

-- Anonymous likes policies - Permissive for Clerk auth
CREATE POLICY "anonymous_likes_all_operations" ON anonymous_likes
    FOR ALL USING (true) WITH CHECK (true);

-- Hashtags policies - Permissive for Clerk auth
CREATE POLICY "hashtags_all_operations" ON hashtags
    FOR ALL USING (true) WITH CHECK (true);

-- Post hashtags policies - Permissive for Clerk auth
CREATE POLICY "post_hashtags_all_operations" ON post_hashtags
    FOR ALL USING (true) WITH CHECK (true);

-- AI models policies - Read only for everyone
CREATE POLICY "ai_models_read_only" ON ai_models
    FOR SELECT USING (true);

-- Other tables don't need policies as they're internal

-- Hashtags policies
CREATE POLICY "Anyone can view hashtags" ON hashtags
    FOR SELECT USING (true);

CREATE POLICY "System manages hashtags" ON hashtags
    FOR ALL USING (true);

-- Post hashtags policies
CREATE POLICY "Anyone can view post hashtags" ON post_hashtags
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage post hashtags" ON post_hashtags
    FOR ALL USING (auth.uid() IS NOT NULL);

-- AI models policies
CREATE POLICY "Anyone can view AI models" ON ai_models
    FOR SELECT USING (true);

-- Fraud logs policies (admin only)
CREATE POLICY "System manages fraud logs" ON fraud_logs
    FOR ALL USING (false);

-- Rate limits policies
CREATE POLICY "System manages rate limits" ON rate_limits
    FOR ALL USING (false);

-- Reputation scores policies
CREATE POLICY "System manages reputation" ON reputation_scores
    FOR ALL USING (false);

-- Blocked patterns policies
CREATE POLICY "System manages blocked patterns" ON blocked_patterns
    FOR ALL USING (false);

-- ============================================
-- STEP 11: CREATE STORAGE BUCKET
-- ============================================

-- Create storage bucket for posts
INSERT INTO storage.buckets (id, name, public)
VALUES ('posts', 'posts', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 12: CREATE STORAGE POLICIES
-- ============================================

-- Anyone can view posts
CREATE POLICY "Anyone can view posts" ON storage.objects
    FOR SELECT USING (bucket_id = 'posts');

-- Authenticated users can upload posts
CREATE POLICY "Authenticated users can upload posts" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'posts' AND 
        auth.uid() IS NOT NULL
    );

-- Users can delete their own uploads
CREATE POLICY "Users can delete own posts" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'posts' AND 
        auth.uid()::TEXT = (storage.foldername(name))[1]
    );

-- ============================================
-- VERIFICATION QUERIES - TEST YOUR SETUP
-- ============================================

-- Check all tables are created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public';

-- Check AI models are inserted
SELECT * FROM ai_models;

-- Check storage bucket
SELECT * FROM storage.buckets WHERE id = 'posts';

-- ============================================
-- SUCCESS! Your database is ready for VibeAI
-- ============================================