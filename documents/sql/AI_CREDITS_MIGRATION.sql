-- ============================================
-- AI CREDITS & USAGE TRACKING MIGRATION
-- Run this in Supabase SQL Editor to enable AI features
-- Date: January 2025
-- ============================================

-- This migration adds the necessary tables for:
-- 1. Tracking AI credits for each user
-- 2. Logging AI generation usage
-- 3. Supporting Nano Banana, Imagen, Gemini, and other AI models

-- ============================================
-- STEP 1: CREATE AI CREDITS TABLE
-- ============================================

-- User AI Credits table for tracking AI usage
CREATE TABLE IF NOT EXISTS user_ai_credits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    
    -- Image generation credits
    imagen_used INTEGER DEFAULT 0,
    imagen_limit INTEGER DEFAULT 10,
    gemini_used INTEGER DEFAULT 0,
    gemini_limit INTEGER DEFAULT 50,
    grok_used INTEGER DEFAULT 0,
    grok_limit INTEGER DEFAULT 5,
    veo_used INTEGER DEFAULT 0,
    veo_limit INTEGER DEFAULT 2,
    nano_banana_used INTEGER DEFAULT 0,
    nano_banana_limit INTEGER DEFAULT 10,
    
    -- Chat credits
    chat_messages_used INTEGER DEFAULT 0,
    chat_messages_limit INTEGER DEFAULT 100,
    
    -- Wan AI credits (for future use)
    wan_text_to_image_used INTEGER DEFAULT 0,
    wan_text_to_image_limit INTEGER DEFAULT 5,
    wan_text_to_video_used INTEGER DEFAULT 0,
    wan_text_to_video_limit INTEGER DEFAULT 2,
    wan_image_to_video_used INTEGER DEFAULT 0,
    wan_image_to_video_limit INTEGER DEFAULT 2,
    
    -- Reset tracking (monthly reset)
    reset_date TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
    last_reset TIMESTAMPTZ DEFAULT NOW(),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 2: CREATE GENERATION USAGE TABLE
-- ============================================

-- AI Generation Usage tracking
CREATE TABLE IF NOT EXISTS ai_generation_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    model TEXT NOT NULL,
    prompt TEXT,
    status TEXT DEFAULT 'processing', -- processing, completed, failed
    result_url TEXT,
    result_data JSONB, -- stores URLs, text, and other response data
    error_message TEXT,
    generation_time_ms INTEGER,
    credits_used INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 3: CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_user_ai_credits_user_id 
ON user_ai_credits(user_id);

-- Indexes for usage tracking queries
CREATE INDEX IF NOT EXISTS idx_ai_generation_usage_user_id 
ON ai_generation_usage(user_id);

CREATE INDEX IF NOT EXISTS idx_ai_generation_usage_created_at 
ON ai_generation_usage(created_at);

CREATE INDEX IF NOT EXISTS idx_ai_generation_usage_model 
ON ai_generation_usage(model);

-- ============================================
-- STEP 4: ENABLE ROW LEVEL SECURITY
-- ============================================

-- Enable RLS for both tables
ALTER TABLE user_ai_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generation_usage ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 5: CREATE RLS POLICIES
-- ============================================

-- Drop existing policies if they exist (safe to run multiple times)
DROP POLICY IF EXISTS "Users can read own AI credits" ON user_ai_credits;
DROP POLICY IF EXISTS "Users can create own AI credits" ON user_ai_credits;
DROP POLICY IF EXISTS "Users can update own AI credits" ON user_ai_credits;
DROP POLICY IF EXISTS "Users can read own generation usage" ON ai_generation_usage;
DROP POLICY IF EXISTS "Users can create generation usage" ON ai_generation_usage;

-- Policies for user_ai_credits
-- Allow all operations for now (you can tighten these later)
CREATE POLICY "Users can read own AI credits" ON user_ai_credits
    FOR SELECT USING (true);

CREATE POLICY "Users can create own AI credits" ON user_ai_credits
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own AI credits" ON user_ai_credits
    FOR UPDATE USING (true);

-- Policies for ai_generation_usage
CREATE POLICY "Users can read own generation usage" ON ai_generation_usage
    FOR SELECT USING (true);

CREATE POLICY "Users can create generation usage" ON ai_generation_usage
    FOR INSERT WITH CHECK (true);

-- ============================================
-- STEP 6: CREATE HELPER FUNCTIONS (Optional)
-- ============================================

-- Function to check if user has credits for a model
CREATE OR REPLACE FUNCTION check_ai_credits(
    p_user_id TEXT,
    p_model TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    v_used INTEGER;
    v_limit INTEGER;
BEGIN
    -- Get the current usage and limit for the model
    SELECT 
        CASE p_model
            WHEN 'nano_banana' THEN nano_banana_used
            WHEN 'imagen' THEN imagen_used
            WHEN 'gemini_chat' THEN chat_messages_used
            WHEN 'grok' THEN grok_used
            WHEN 'veo' THEN veo_used
            ELSE 0
        END,
        CASE p_model
            WHEN 'nano_banana' THEN nano_banana_limit
            WHEN 'imagen' THEN imagen_limit
            WHEN 'gemini_chat' THEN chat_messages_limit
            WHEN 'grok' THEN grok_limit
            WHEN 'veo' THEN veo_limit
            ELSE 0
        END
    INTO v_used, v_limit
    FROM user_ai_credits
    WHERE user_id = p_user_id;
    
    -- If no record exists, create one with defaults
    IF NOT FOUND THEN
        INSERT INTO user_ai_credits (user_id) VALUES (p_user_id);
        RETURN true; -- Allow first use
    END IF;
    
    -- Check if user has credits remaining
    RETURN v_used < v_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to increment usage after successful generation
CREATE OR REPLACE FUNCTION increment_ai_usage(
    p_user_id TEXT,
    p_model TEXT,
    p_credits INTEGER DEFAULT 1
) RETURNS void AS $$
BEGIN
    -- Create record if it doesn't exist
    INSERT INTO user_ai_credits (user_id)
    VALUES (p_user_id)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Update the appropriate counter
    UPDATE user_ai_credits
    SET 
        nano_banana_used = CASE 
            WHEN p_model = 'nano_banana' THEN nano_banana_used + p_credits 
            ELSE nano_banana_used 
        END,
        imagen_used = CASE 
            WHEN p_model = 'imagen' THEN imagen_used + p_credits 
            ELSE imagen_used 
        END,
        chat_messages_used = CASE 
            WHEN p_model = 'gemini_chat' THEN chat_messages_used + p_credits 
            ELSE chat_messages_used 
        END,
        grok_used = CASE 
            WHEN p_model = 'grok' THEN grok_used + p_credits 
            ELSE grok_used 
        END,
        veo_used = CASE 
            WHEN p_model = 'veo' THEN veo_used + p_credits 
            ELSE veo_used 
        END,
        updated_at = NOW()
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 7: INSERT DEFAULT CREDITS FOR TESTING
-- ============================================

-- Give some free credits to existing users (optional)
-- Uncomment if you want to give credits to existing users
/*
INSERT INTO user_ai_credits (user_id)
SELECT DISTINCT user_id FROM posts
ON CONFLICT (user_id) DO NOTHING;
*/

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if tables were created successfully
SELECT 'user_ai_credits' as table_name, COUNT(*) as row_count FROM user_ai_credits
UNION ALL
SELECT 'ai_generation_usage', COUNT(*) FROM ai_generation_usage;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('user_ai_credits', 'ai_generation_usage');

-- Check policies are created
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('user_ai_credits', 'ai_generation_usage');

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
-- If you see this, the migration completed successfully!
-- Your AI features should now work properly.
-- 
-- Next steps:
-- 1. Test AI generation in /ai-studio
-- 2. Monitor the ai_generation_usage table for logs
-- 3. Check user_ai_credits for credit tracking
-- ============================================