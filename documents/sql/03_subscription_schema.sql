-- Subscription Plans and AI Generation Tracking Schema
-- =====================================================

-- Subscription Plans Table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  interval TEXT CHECK (interval IN ('monthly', 'yearly')) DEFAULT 'monthly',
  features JSONB DEFAULT '{}',
  ai_generation_limits JSONB DEFAULT '{
    "imagen": 100,
    "gemini": 500,
    "grok": 100,
    "veo": 20,
    "nano_banana": 200,
    "chat_messages": 1000
  }',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- User Subscriptions Table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plan_id UUID REFERENCES subscription_plans(id),
  status TEXT CHECK (status IN ('active', 'cancelled', 'expired', 'trial')) DEFAULT 'trial',
  current_period_start TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- AI Generation Usage Tracking
CREATE TABLE IF NOT EXISTS ai_generation_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  model TEXT NOT NULL CHECK (model IN ('imagen', 'gemini', 'grok', 'veo', 'nano_banana')),
  prompt TEXT NOT NULL,
  revised_prompt TEXT,
  result_url TEXT,
  result_data JSONB,
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
  error_message TEXT,
  generation_time_ms INTEGER,
  credits_used INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- AI Chat Conversations
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT,
  model TEXT DEFAULT 'gemini',
  messages JSONB DEFAULT '[]',
  total_tokens INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- User AI Credits/Usage
CREATE TABLE IF NOT EXISTS user_ai_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  imagen_used INTEGER DEFAULT 0,
  imagen_limit INTEGER DEFAULT 10, -- Free tier
  gemini_used INTEGER DEFAULT 0,
  gemini_limit INTEGER DEFAULT 50, -- Free tier
  grok_used INTEGER DEFAULT 0,
  grok_limit INTEGER DEFAULT 10, -- Free tier
  veo_used INTEGER DEFAULT 0,
  veo_limit INTEGER DEFAULT 2, -- Free tier
  nano_banana_used INTEGER DEFAULT 0,
  nano_banana_limit INTEGER DEFAULT 20, -- Free tier
  chat_messages_used INTEGER DEFAULT 0,
  chat_messages_limit INTEGER DEFAULT 100, -- Free tier
  reset_date TIMESTAMPTZ DEFAULT (DATE_TRUNC('month', CURRENT_TIMESTAMP) + INTERVAL '1 month'),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Generated Content Gallery Link
CREATE TABLE IF NOT EXISTS ai_generated_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  generation_id UUID REFERENCES ai_generation_usage(id),
  post_id UUID REFERENCES posts(id),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, price, currency, interval, features, ai_generation_limits)
VALUES 
  ('Free', 0, 'USD', 'monthly', 
   '{"chat": true, "basic_generation": true, "gallery_upload": true}',
   '{"imagen": 10, "gemini": 50, "grok": 10, "veo": 2, "nano_banana": 20, "chat_messages": 100}'),
  
  ('Pro', 20, 'USD', 'monthly',
   '{"chat": true, "unlimited_generation": true, "gallery_upload": true, "priority_processing": true, "hd_quality": true}',
   '{"imagen": 1000, "gemini": 5000, "grok": 1000, "veo": 100, "nano_banana": 2000, "chat_messages": 10000}'),
  
  ('Enterprise', 100, 'USD', 'monthly',
   '{"chat": true, "unlimited_generation": true, "gallery_upload": true, "priority_processing": true, "hd_quality": true, "api_access": true, "team_collaboration": true}',
   '{"imagen": -1, "gemini": -1, "grok": -1, "veo": -1, "nano_banana": -1, "chat_messages": -1}')
ON CONFLICT DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_ai_generation_usage_user_id ON ai_generation_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_generation_usage_model ON ai_generation_usage(model);
CREATE INDEX IF NOT EXISTS idx_ai_generation_usage_status ON ai_generation_usage(status);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ai_credits_user_id ON user_ai_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_generated_content_user_id ON ai_generated_content(user_id);

-- Function to check if user has credits for a model
CREATE OR REPLACE FUNCTION check_user_ai_credits(
  p_user_id UUID,
  p_model TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_used INTEGER;
  v_limit INTEGER;
BEGIN
  SELECT 
    CASE p_model
      WHEN 'imagen' THEN imagen_used
      WHEN 'gemini' THEN gemini_used
      WHEN 'grok' THEN grok_used
      WHEN 'veo' THEN veo_used
      WHEN 'nano_banana' THEN nano_banana_used
      ELSE chat_messages_used
    END,
    CASE p_model
      WHEN 'imagen' THEN imagen_limit
      WHEN 'gemini' THEN gemini_limit
      WHEN 'grok' THEN grok_limit
      WHEN 'veo' THEN veo_limit
      WHEN 'nano_banana' THEN nano_banana_limit
      ELSE chat_messages_limit
    END
  INTO v_used, v_limit
  FROM user_ai_credits
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    -- Create default credits for new user
    INSERT INTO user_ai_credits (user_id) VALUES (p_user_id);
    RETURN TRUE;
  END IF;
  
  -- -1 means unlimited
  IF v_limit = -1 THEN
    RETURN TRUE;
  END IF;
  
  RETURN v_used < v_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to increment usage
CREATE OR REPLACE FUNCTION increment_ai_usage(
  p_user_id UUID,
  p_model TEXT,
  p_amount INTEGER DEFAULT 1
) RETURNS VOID AS $$
BEGIN
  UPDATE user_ai_credits
  SET 
    imagen_used = CASE WHEN p_model = 'imagen' THEN imagen_used + p_amount ELSE imagen_used END,
    gemini_used = CASE WHEN p_model = 'gemini' THEN gemini_used + p_amount ELSE gemini_used END,
    grok_used = CASE WHEN p_model = 'grok' THEN grok_used + p_amount ELSE grok_used END,
    veo_used = CASE WHEN p_model = 'veo' THEN veo_used + p_amount ELSE veo_used END,
    nano_banana_used = CASE WHEN p_model = 'nano_banana' THEN nano_banana_used + p_amount ELSE nano_banana_used END,
    chat_messages_used = CASE WHEN p_model = 'chat' THEN chat_messages_used + p_amount ELSE chat_messages_used END,
    updated_at = CURRENT_TIMESTAMP
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to reset monthly usage
CREATE OR REPLACE FUNCTION reset_monthly_usage() RETURNS VOID AS $$
BEGIN
  UPDATE user_ai_credits
  SET 
    imagen_used = 0,
    gemini_used = 0,
    grok_used = 0,
    veo_used = 0,
    nano_banana_used = 0,
    chat_messages_used = 0,
    reset_date = DATE_TRUNC('month', CURRENT_TIMESTAMP) + INTERVAL '1 month',
    updated_at = CURRENT_TIMESTAMP
  WHERE reset_date <= CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to reset usage (requires pg_cron extension)
-- SELECT cron.schedule('reset-monthly-usage', '0 0 1 * *', 'SELECT reset_monthly_usage();');