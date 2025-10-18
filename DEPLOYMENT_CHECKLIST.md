# VibeAI Deployment Checklist

## ✅ Pre-Deployment Setup

### 1. Supabase Storage Setup
- [ ] Run `documents/sql/STORAGE_SETUP.sql` in Supabase SQL Editor
- [ ] Verify bucket `ai-generations` is created and public
- [ ] Verify 4 storage policies are active
- [ ] Test image upload manually in Supabase dashboard

**Reference**: See `STORAGE_SETUP_GUIDE.md` for detailed instructions

### 2. Environment Variables
Copy `.env.local.example` to `.env.local` and fill in:

**Required**:
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- [ ] `CLERK_SECRET_KEY`
- [ ] `GEMINI_API_KEY` (for Nano Banana)

**Optional** (add as needed):
- [ ] `XAI_API_KEY` (for Grok)
- [ ] `WAN_API_KEY` (for Wan AI)
- [ ] `OPENAI_API_KEY` (for additional models)

### 3. Database Setup
Run these SQL files in order:

1. [ ] `documents/sql/01_database_schema.sql` - Core tables
2. [ ] `documents/sql/AI_CREDITS_MIGRATION.sql` - AI credits system
3. [ ] `documents/sql/STORAGE_SETUP.sql` - Storage bucket & policies

### 4. Clean Up Local Storage
If you have old local images, delete them:

```bash
rm -rf public/generated
```

New images will be stored in Supabase Storage automatically.

## 🚀 Deployment Steps

### Vercel Deployment

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Fix: Use Supabase Storage for AI generations"
   git push origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Configure environment variables (copy from `.env.local`)

3. **Add Environment Variables in Vercel**:
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.local`
   - Click "Deploy"

### Post-Deployment Verification

1. [ ] Visit your deployed URL
2. [ ] Sign in with Clerk
3. [ ] Go to AI Studio
4. [ ] Generate an image with Nano Banana
5. [ ] Verify image appears correctly
6. [ ] Check Supabase Storage to confirm upload
7. [ ] Test uploading image to gallery

## 🔍 Testing Checklist

### AI Generation Tests
- [ ] **Nano Banana**: Text-to-image generation
- [ ] **Nano Banana**: Image-to-image editing (upload + prompt)
- [ ] **Nano Banana**: All settings work (temperature, aspect ratio, etc.)
- [ ] **Imagen**: Photorealistic generation (if API key configured)
- [ ] **Grok**: Image generation (if API key configured)
- [ ] **Veo**: Video generation (if API key configured)

### Storage Tests
- [ ] Images save to Supabase Storage
- [ ] Public URLs are accessible
- [ ] Images load in AI Studio preview
- [ ] Images persist after page refresh
- [ ] Upload to Gallery works with generated images

### User Experience Tests
- [ ] Sign up flow works
- [ ] Sign in flow works
- [ ] AI credits are tracked correctly
- [ ] Credit limits are enforced
- [ ] Error messages are user-friendly
- [ ] Loading states show correctly

## 🐛 Common Issues & Fixes

### Issue: Images not saving

**Check**:
1. Supabase Storage bucket exists and is public
2. Storage policies are configured correctly
3. `NEXT_PUBLIC_SUPABASE_URL` is correct in env
4. Server logs show actual error message

**Fix**: Run `STORAGE_SETUP.sql` again

### Issue: 403 Forbidden on images

**Check**:
1. Bucket is marked as **public** in Supabase
2. "Anyone can view AI generations" policy exists
3. RLS is NOT blocking access

**Fix**:
```sql
-- Make bucket public
UPDATE storage.buckets
SET public = true
WHERE id = 'ai-generations';
```

### Issue: API key errors

**Check**:
1. `GEMINI_API_KEY` is set in environment variables
2. API key is valid (test at https://makersuite.google.com)
3. Billing is enabled on Google Cloud (if using production API)

**Fix**: Get new API key from Google AI Studio

### Issue: Credits not deducting

**Check**:
1. `AI_CREDITS_MIGRATION.sql` was run
2. User exists in `user_ai_credits` table
3. Server logs show credit deduction logic

**Fix**:
```sql
-- Check user credits
SELECT * FROM user_ai_credits WHERE user_id = 'your_user_id';
```

## 📊 Monitoring

### Supabase Dashboard
- **Storage**: Monitor usage and bandwidth
- **Database**: Check query performance
- **Logs**: View real-time logs for errors

### Vercel Dashboard
- **Analytics**: Monitor page views and performance
- **Logs**: Check deployment and runtime logs
- **Usage**: Track bandwidth and function executions

### Set Up Alerts
- [ ] Supabase storage approaching 80% capacity
- [ ] API error rate > 5%
- [ ] Credit system errors
- [ ] Authentication failures

## 🔐 Security Checklist

- [ ] `.env.local` is in `.gitignore`
- [ ] No API keys committed to Git
- [ ] Clerk webhook secrets are secure
- [ ] Supabase RLS policies are enabled
- [ ] Storage bucket policies are correct
- [ ] Rate limiting is configured
- [ ] CORS settings are appropriate

## 📈 Performance Optimization

### Image Optimization
- [ ] Use Supabase image transformations for thumbnails
- [ ] Set appropriate cache headers (already configured)
- [ ] Consider CDN caching

### Database
- [ ] Indexes on frequently queried columns
- [ ] Vacuum database regularly (Supabase does this automatically)

### API
- [ ] Rate limiting configured
- [ ] Timeout settings appropriate (60s for Nano Banana)

## 🎉 Launch Checklist

**Final Checks Before Going Live**:
- [ ] All environment variables set in production
- [ ] Database migrations run successfully
- [ ] Storage bucket configured and tested
- [ ] AI generation works end-to-end
- [ ] Upload to gallery works
- [ ] User authentication works
- [ ] Error handling is graceful
- [ ] Loading states are smooth
- [ ] Mobile responsive design verified
- [ ] SEO meta tags configured
- [ ] Analytics tracking set up
- [ ] Monitoring alerts configured

## 📞 Support

**Need Help?**
- 📖 [VibeAI Documentation](./README.md)
- 📖 [Supabase Docs](https://supabase.com/docs)
- 📖 [Clerk Docs](https://clerk.com/docs)
- 📖 [Next.js Docs](https://nextjs.org/docs)
- 💬 Create an issue on GitHub

---

**Last Updated**: $(date)
**Version**: 1.0.0
