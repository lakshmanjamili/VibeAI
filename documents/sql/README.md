# 🗄️ VibeAI Database Setup - PRODUCTION READY

## ⚡ Quick Setup (Run in Order)

### 1️⃣ `01_database_schema.sql`

Run FIRST in Supabase SQL Editor. Contains:

- All 14 tables (posts, users, likes, comments, etc.)
- Anonymous tracking tables (anonymous_likes, fraud_logs)
- Anti-bot protection tables (rate_limits, reputation_scores)
- Views (posts_with_metrics, suspicious_activity_summary)
- Functions (toggle_anonymous_like, get_user_storage_usage)
- RLS policies for security
- All indexes for performance

### 2️⃣ `02_storage_setup.sql`

Run SECOND after database is created. Contains:

- Storage bucket creation
- Storage policies
- File organization structure
- Public access configuration

## ✅ That's It!

Just these 2 files for complete production setup. No other SQL files needed.

## 📊 Verify Installation

After running both files, test with:

```sql
SELECT
    (SELECT COUNT(*) FROM posts) as posts,
    (SELECT COUNT(*) FROM users) as users,
    (SELECT COUNT(*) FROM anonymous_likes) as likes;
```

## 🔧 Features Included

- ✅ Session-based anonymous voting
- ✅ 10-layer anti-bot protection
- ✅ Organized storage (year/month/category/user)
- ✅ Real-time metrics aggregation
- ✅ Fraud detection and logging
- ✅ Rate limiting
- ✅ Device fingerprinting support
