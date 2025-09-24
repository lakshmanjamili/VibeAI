-- 📦 SUPABASE STORAGE SETUP FOR VIBEAI
-- Run this script in your Supabase SQL editor to set up storage

-- ============================================
-- STEP 1: CREATE STORAGE BUCKET
-- ============================================
-- Note: This needs to be done via Supabase Dashboard or API
-- Go to Storage section and create a bucket named 'posts'
-- Settings:
--   - Public: true
--   - Max file size: 100MB (104857600 bytes)
--   - Allowed MIME types: image/*, video/*, application/pdf

-- You can also create via SQL (if using Supabase CLI):
INSERT INTO storage.buckets (id, name, public)
VALUES ('posts', 'posts', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- ============================================
-- STEP 2: CREATE STORAGE POLICIES
-- ============================================

-- Drop existing policies first
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;

-- Policy 1: PUBLIC VIEW ACCESS
-- Anyone can view uploaded content
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'posts');

-- Policy 2: PUBLIC UPLOAD ACCESS (since we use Clerk for auth, not Supabase auth)
-- Allow uploads from the application using anon key
CREATE POLICY "Application can upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'posts');

-- Policy 3: PUBLIC DELETE ACCESS (controlled by application logic)
-- Application handles authorization
CREATE POLICY "Application can delete" ON storage.objects
FOR DELETE USING (bucket_id = 'posts');

-- Policy 4: PUBLIC UPDATE ACCESS (controlled by application logic)
-- Application handles authorization
CREATE POLICY "Application can update" ON storage.objects
FOR UPDATE USING (bucket_id = 'posts');

-- ============================================
-- STEP 3: VERIFY STORAGE SETUP
-- ============================================

-- Check if bucket exists
SELECT * FROM storage.buckets WHERE id = 'posts';

-- Check storage policies
SELECT * FROM storage.objects 
WHERE bucket_id = 'posts' 
LIMIT 1;

-- ============================================
-- STEP 4: HELPER FUNCTIONS FOR STORAGE
-- ============================================

-- Drop function if exists
DROP FUNCTION IF EXISTS get_user_storage_usage(UUID);

-- Function to get user's total storage usage
CREATE OR REPLACE FUNCTION get_user_storage_usage(user_uuid UUID)
RETURNS TABLE(
    total_size_bytes BIGINT,
    total_files INTEGER,
    size_by_category JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH user_files AS (
        SELECT 
            name,
            (metadata->>'size')::BIGINT AS size,
            (string_to_array(name, '/'))[3] AS category
        FROM storage.objects
        WHERE 
            bucket_id = 'posts' AND
            (string_to_array(name, '/'))[4] = user_uuid::TEXT
    ),
    category_stats AS (
        SELECT 
            COALESCE(category, 'unknown') AS category,
            SUM(size)::BIGINT AS category_size
        FROM user_files
        GROUP BY category
    ),
    totals AS (
        SELECT 
            COALESCE(SUM(size), 0)::BIGINT AS total_size_bytes,
            COUNT(*)::INTEGER AS total_files
        FROM user_files
    )
    SELECT 
        totals.total_size_bytes::BIGINT,
        totals.total_files::INTEGER,
        COALESCE(
            (SELECT jsonb_object_agg(category, category_size) FROM category_stats),
            '{}'::jsonb
        ) AS size_by_category
    FROM totals;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop function if exists
DROP FUNCTION IF EXISTS archive_old_files(INTEGER);

-- Function to clean up old files (archive)
CREATE OR REPLACE FUNCTION archive_old_files(older_than_months INTEGER DEFAULT 12)
RETURNS INTEGER AS $$
DECLARE
    archived_count INTEGER := 0;
    cutoff_date DATE;
BEGIN
    cutoff_date := CURRENT_DATE - INTERVAL '1 month' * older_than_months;
    
    -- Note: This is a placeholder. Actual archiving would involve:
    -- 1. Moving files to an archive bucket
    -- 2. Updating database references
    -- 3. Removing from main bucket
    
    -- For now, just count files that would be archived
    SELECT COUNT(*)
    INTO archived_count
    FROM storage.objects
    WHERE 
        bucket_id = 'posts' AND
        created_at < cutoff_date;
    
    RETURN archived_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 5: STORAGE MONITORING
-- ============================================

-- Drop and recreate views
DROP VIEW IF EXISTS storage_usage_by_category;
CREATE VIEW storage_usage_by_category AS
SELECT 
    (string_to_array(name, '/'))[3] AS category,
    COUNT(*) AS file_count,
    SUM((metadata->>'size')::BIGINT) AS total_size_bytes,
    ROUND(SUM((metadata->>'size')::BIGINT) / 1024.0 / 1024.0, 2) AS total_size_mb,
    AVG((metadata->>'size')::BIGINT) AS avg_size_bytes,
    MAX((metadata->>'size')::BIGINT) AS max_size_bytes
FROM storage.objects
WHERE bucket_id = 'posts'
GROUP BY (string_to_array(name, '/'))[3];

DROP VIEW IF EXISTS storage_usage_by_user;
CREATE VIEW storage_usage_by_user AS
SELECT 
    (string_to_array(name, '/'))[4] AS user_id,
    COUNT(*) AS file_count,
    SUM((metadata->>'size')::BIGINT) AS total_size_bytes,
    ROUND(SUM((metadata->>'size')::BIGINT) / 1024.0 / 1024.0, 2) AS total_size_mb,
    MAX(created_at) AS last_upload
FROM storage.objects
WHERE bucket_id = 'posts'
GROUP BY (string_to_array(name, '/'))[4]
ORDER BY total_size_bytes DESC;

DROP VIEW IF EXISTS storage_usage_by_month;
CREATE VIEW storage_usage_by_month AS
SELECT 
    (string_to_array(name, '/'))[1] AS year,
    (string_to_array(name, '/'))[2] AS month,
    COUNT(*) AS file_count,
    SUM((metadata->>'size')::BIGINT) AS total_size_bytes,
    ROUND(SUM((metadata->>'size')::BIGINT) / 1024.0 / 1024.0, 2) AS total_size_mb
FROM storage.objects
WHERE bucket_id = 'posts'
GROUP BY 
    (string_to_array(name, '/'))[1],
    (string_to_array(name, '/'))[2]
ORDER BY year DESC, month DESC;

-- ============================================
-- STEP 6: STORAGE LIMITS AND QUOTAS
-- ============================================

-- Table to track user storage quotas (optional)
CREATE TABLE IF NOT EXISTS user_storage_quotas (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    max_storage_bytes BIGINT DEFAULT 1073741824, -- 1GB default
    max_files INTEGER DEFAULT 1000,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drop function if exists
DROP FUNCTION IF EXISTS can_user_upload(UUID, BIGINT);

-- Function to check if user can upload
CREATE OR REPLACE FUNCTION can_user_upload(
    user_uuid UUID,
    file_size_bytes BIGINT
) RETURNS BOOLEAN AS $$
DECLARE
    current_usage RECORD;
    user_quota RECORD;
BEGIN
    -- Get user's current usage
    SELECT * INTO current_usage
    FROM get_user_storage_usage(user_uuid);
    
    -- Get user's quota
    SELECT * INTO user_quota
    FROM user_storage_quotas
    WHERE user_id = user_uuid;
    
    -- If no quota set, use defaults
    IF user_quota IS NULL THEN
        -- Default: 1GB, 1000 files
        IF current_usage.total_size_bytes + file_size_bytes > 1073741824 THEN
            RETURN FALSE;
        END IF;
        IF current_usage.total_files >= 1000 THEN
            RETURN FALSE;
        END IF;
    ELSE
        -- Check against user's specific quota
        IF current_usage.total_size_bytes + file_size_bytes > user_quota.max_storage_bytes THEN
            RETURN FALSE;
        END IF;
        IF current_usage.total_files >= user_quota.max_files THEN
            RETURN FALSE;
        END IF;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 7: CLEANUP AND MAINTENANCE
-- ============================================

-- Drop function if exists
DROP FUNCTION IF EXISTS delete_user_storage(UUID);

-- Function to delete all files for a user (GDPR compliance)
CREATE OR REPLACE FUNCTION delete_user_storage(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
BEGIN
    -- Delete all files for the user
    DELETE FROM storage.objects
    WHERE 
        bucket_id = 'posts' AND
        (string_to_array(name, '/'))[4] = user_uuid::TEXT;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Also delete user's posts from database
    DELETE FROM posts WHERE user_id = user_uuid;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Run these to verify everything is set up correctly:

-- 1. Check bucket exists
SELECT id, name, public FROM storage.buckets WHERE id = 'posts';

-- 2. Check policies are created
SELECT policyname, tablename, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- 3. Check helper functions exist
SELECT proname 
FROM pg_proc 
WHERE proname IN (
    'get_user_storage_usage', 
    'can_user_upload', 
    'delete_user_storage',
    'archive_old_files'
);

-- 4. Check monitoring views exist
SELECT viewname 
FROM pg_views 
WHERE viewname IN (
    'storage_usage_by_category',
    'storage_usage_by_user', 
    'storage_usage_by_month'
);

-- ============================================
-- MANUAL STEPS IN SUPABASE DASHBOARD
-- ============================================
/*
1. Go to Storage section in Supabase Dashboard
2. Click "New bucket"
3. Configure:
   - Bucket name: posts
   - Public bucket: ✓ (checked)
   - File size limit: 100MB
   - Allowed MIME types: Add these:
     * image/jpeg
     * image/png
     * image/gif
     * image/webp
     * video/mp4
     * video/webm
     * video/quicktime
     * application/pdf
4. Click "Create bucket"
5. Run this SQL script in SQL Editor
6. Verify with the verification queries above
*/

-- ============================================
-- TESTING THE SETUP
-- ============================================

-- Test query to simulate checking if a user can upload
SELECT can_user_upload(
    '550e8400-e29b-41d4-a716-446655440000'::UUID, 
    5242880 -- 5MB file
);

-- Test query to get user's storage usage (replace with actual user ID)
SELECT * FROM get_user_storage_usage('550e8400-e29b-41d4-a716-446655440000'::UUID);

-- View storage statistics
SELECT * FROM storage_usage_by_category;
SELECT * FROM storage_usage_by_user LIMIT 10;
SELECT * FROM storage_usage_by_month;