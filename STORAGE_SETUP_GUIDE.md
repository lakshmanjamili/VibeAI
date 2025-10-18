# Supabase Storage Setup Guide

## Overview

VibeAI uses Supabase Storage to store all AI-generated images and videos. This ensures your generated content is:

- ✅ Stored in the cloud (not locally)
- ✅ Publicly accessible via CDN URLs
- ✅ Scalable and reliable
- ✅ Automatically backed up

## Setup Steps

### 1. Create the Storage Bucket

Go to your Supabase project dashboard:

1. Navigate to **Storage** in the left sidebar
2. Click **"New bucket"**
3. Configure the bucket:
   - **Name**: `ai-generations`
   - **Public bucket**: ✅ Enable (so images can be viewed publicly)
   - **File size limit**: 500 MB (or adjust as needed)
   - **Allowed MIME types**: Add these:
     - `image/jpeg`
     - `image/jpg`
     - `image/png`
     - `image/gif`
     - `image/webp`
     - `video/mp4`
     - `video/webm`
     - `video/quicktime`

### 2. Set Up Storage Policies

Run the SQL script in your Supabase SQL Editor:

1. Go to **SQL Editor** in the Supabase dashboard
2. Click **"New query"**
3. Copy and paste the contents of `/documents/sql/STORAGE_SETUP.sql`
4. Click **"Run"**

This will create the following policies:

- ✅ Authenticated users can upload AI generations
- ✅ Anonymous users can upload AI generations
- ✅ Anyone can view AI generations (public access)
- ✅ Users can delete their own generations

### 3. Verify Setup

Run this query in the SQL Editor to verify:

```sql
-- Check bucket exists
SELECT * FROM storage.buckets WHERE id = 'ai-generations';

-- Check policies are active
SELECT * FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%AI%';
```

You should see:

- ✅ 1 bucket named `ai-generations`
- ✅ 4 storage policies

## How It Works

### Upload Flow

1. **User generates image** in AI Studio
2. **Image is saved as base64** from API response
3. **Server uploads to Supabase Storage**:
   ```typescript
   // lib/ai-services/index.ts
   const { data, error } = await supabase.storage
     .from('ai-generations')
     .upload(`generated/${filename}`, buffer, {
       contentType: 'image/jpeg',
       cacheControl: '3600',
     });
   ```
4. **Public URL is returned** to the client
5. **Image is displayed** using the Supabase CDN URL

### File Naming Convention

Generated files are stored with this pattern:

```
ai-generations/
  └── generated/
      └── gen_1234567890_abc123.jpg
```

Format: `gen_{timestamp}_{random}.jpg`

## Troubleshooting

### Error: "Bucket not found"

**Solution**: Make sure you created the bucket in step 1 above.

### Error: "Policy check violation"

**Solution**: Run the STORAGE_SETUP.sql script to create the necessary policies.

### Images not showing up

**Checklist**:

1. ✅ Bucket is marked as **public**
2. ✅ "Anyone can view AI generations" policy is active
3. ✅ CORS is enabled (Supabase does this automatically for public buckets)
4. ✅ Check browser console for 403 errors

### Delete old local images

If you have images in `public/generated/`, you can safely delete that folder:

```bash
rm -rf public/generated
```

All new images will be stored in Supabase Storage.

## Storage Limits

### Free Tier (Supabase)

- **Storage**: 1 GB
- **Bandwidth**: 2 GB/month
- **File uploads**: Unlimited

### Recommendations

- Monitor your usage in Supabase dashboard
- Set up alerts for when you approach limits
- Upgrade to Pro plan ($25/month) when needed:
  - 100 GB storage
  - 200 GB bandwidth

## Advanced Configuration

### Enable Image Transformations (Optional)

Supabase supports on-the-fly image transformations. Add to your image URLs:

```typescript
// Original
const url = publicUrlData.publicUrl;

// Resize to 800x800
const resizedUrl = `${url}?width=800&height=800`;

// Generate thumbnail
const thumbnailUrl = `${url}?width=200&height=200`;
```

### Set Cache Headers

Already configured in the upload code:

```typescript
cacheControl: '3600'; // Cache for 1 hour
```

Adjust this value based on your needs.

## Security Best Practices

1. ✅ **Never store sensitive data** in public buckets
2. ✅ **Use authenticated policies** for user-specific content
3. ✅ **Set file size limits** to prevent abuse
4. ✅ **Monitor usage** regularly
5. ✅ **Enable RLS** on other database tables

## Need Help?

- 📖 [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- 💬 [Supabase Discord](https://discord.supabase.com)
- 🐛 [Report Issues](https://github.com/your-repo/issues)
