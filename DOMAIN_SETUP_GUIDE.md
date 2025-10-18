# 🌐 Connect WordPress Domain to Vercel Deployment

## 📋 Prerequisites

- WordPress site with domain registered
- VibeAI code deployed on Vercel
- Access to WordPress hosting DNS settings

---

## 🚀 Method 1: Point WordPress Domain to Vercel (Recommended)

### **Step 1: Deploy to Vercel**

1. **Login to Vercel:**

```bash
vercel login
```

2. **Deploy your VibeAI project:**

```bash
# From your VibeAI directory
vercel

# Follow prompts:
# - Link to existing project or create new
# - Choose project name
# - Deploy
```

3. **Get your Vercel deployment URL:**

```bash
vercel --prod
```

This will give you a URL like: `https://your-project.vercel.app`

### **Step 2: Configure Custom Domain in Vercel**

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Select your VibeAI project

2. **Add Custom Domain:**
   - Go to "Settings" → "Domains"
   - Click "Add Domain"
   - Enter your WordPress domain (e.g., `yourdomain.com`)
   - Click "Add"

3. **Get DNS Records:**
   Vercel will provide DNS records like:

   ```
   Type: A
   Name: @
   Value: 76.76.19.61

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

### **Step 3: Update DNS in WordPress Hosting**

#### **Option A: If using WordPress.com:**

1. **Go to WordPress.com Dashboard:**
   - Visit: https://wordpress.com/domains
   - Select your domain

2. **Access DNS Settings:**
   - Click "Manage" → "DNS Records"
   - Or go to "Settings" → "General" → "Domain"

3. **Add/Update DNS Records:**
   - Delete existing A records pointing to WordPress
   - Add new A record: `@` → `76.76.19.61`
   - Add CNAME record: `www` → `cname.vercel-dns.com`

#### **Option B: If using Custom WordPress Hosting:**

1. **Access Your Domain Registrar:**
   - GoDaddy, Namecheap, Cloudflare, etc.
   - Go to DNS management

2. **Update DNS Records:**
   - Replace A records with Vercel's IP
   - Update CNAME for www subdomain
   - Keep MX records for email (if any)

#### **Option C: If using WordPress with cPanel:**

1. **Login to cPanel:**
   - Access your hosting provider's cPanel

2. **Go to DNS Zone Editor:**
   - Find "DNS Zone Editor" or "Advanced DNS Zone Editor"

3. **Update Records:**
   - Edit A record for `@` to point to Vercel IP
   - Edit CNAME for `www` to point to Vercel

### **Step 4: Verify Domain Connection**

1. **In Vercel Dashboard:**
   - Check domain status (should show "Valid Configuration")
   - May take 24-48 hours to propagate

2. **Test Your Domain:**
   ```bash
   # Check DNS propagation
   nslookup yourdomain.com
   dig yourdomain.com
   ```

---

## 🚀 Method 2: Subdomain Approach (Alternative)

### **Step 1: Create Subdomain**

- In WordPress hosting, create subdomain: `app.yourdomain.com`
- Point subdomain to Vercel deployment

### **Step 2: Update WordPress**

- Keep main WordPress site at `yourdomain.com`
- Link to VibeAI app at `app.yourdomain.com`

---

## 🔧 Method 3: Reverse Proxy (Advanced)

### **If you want to keep WordPress AND add VibeAI:**

1. **WordPress at root:** `yourdomain.com`
2. **VibeAI at subpath:** `yourdomain.com/app`

**Setup:**

```nginx
# In WordPress hosting (if using Nginx)
location /app {
    proxy_pass https://your-project.vercel.app;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

---

## 🎯 Recommended Setup Steps

### **Step 1: Backup WordPress**

```bash
# Backup your WordPress site before making changes
# Export content, download files, backup database
```

### **Step 2: Deploy VibeAI to Vercel**

```bash
# In your VibeAI directory
vercel login
vercel --prod

# Note the deployment URL
```

### **Step 3: Configure Environment Variables**

```bash
# Add production environment variables in Vercel dashboard
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
```

### **Step 4: Update DNS Settings**

1. Login to your domain registrar/DNS provider
2. Replace A records with Vercel's IP addresses
3. Update CNAME records as needed
4. Wait for propagation (24-48 hours)

### **Step 5: SSL Certificate**

- Vercel automatically provides SSL certificates
- Your site will be accessible via HTTPS

---

## 🔍 Troubleshooting

### **Common Issues:**

1. **"Domain not configured" error:**
   - Check DNS propagation: https://dnschecker.org
   - Verify A records point to correct Vercel IP

2. **WordPress still showing:**
   - DNS may not have propagated yet
   - Clear browser cache
   - Try incognito/private browsing

3. **SSL certificate issues:**
   - Wait for Vercel to issue certificate (can take 24 hours)
   - Check domain status in Vercel dashboard

4. **Email stops working:**
   - Make sure to preserve MX records in DNS
   - Don't delete email-related DNS entries

### **DNS Propagation Check:**

```bash
# Check if DNS has updated
nslookup yourdomain.com
dig yourdomain.com A
```

---

## 📊 What This Achieves

### **Before:**

- `yourdomain.com` → WordPress site
- VibeAI → `your-project.vercel.app`

### **After:**

- `yourdomain.com` → VibeAI (your Next.js app)
- WordPress content can be migrated or archived

---

## 🎉 Benefits of This Setup

1. **Professional Domain:** Your VibeAI app runs on your custom domain
2. **Better SEO:** Custom domain improves search rankings
3. **Brand Consistency:** Users see your domain, not Vercel's
4. **SSL Included:** Automatic HTTPS with Vercel
5. **CDN Performance:** Vercel's global CDN for fast loading
6. **Easy Updates:** Deploy updates with `vercel --prod`

---

## 🚨 Important Notes

### **Before Making Changes:**

1. **Backup WordPress:** Export all content, themes, plugins
2. **Note Email Settings:** Preserve MX records for email
3. **Test First:** Use a subdomain to test before switching main domain
4. **Plan Downtime:** DNS changes can take 24-48 hours

### **SEO Considerations:**

1. **Set up 301 redirects** if WordPress had SEO value
2. **Update Google Search Console** with new site
3. **Submit new sitemap** to search engines

---

## 🔄 Quick Command Summary

```bash
# Deploy to Vercel
vercel login
vercel --prod

# Check deployment
vercel ls

# Add custom domain (in Vercel dashboard)
# Update DNS records (in domain registrar)
# Wait for propagation
# Test: https://yourdomain.com
```

---

## 📞 Need Help?

- **Vercel Docs:** https://vercel.com/docs/concepts/projects/custom-domains
- **DNS Help:** Contact your domain registrar support
- **WordPress Migration:** Consider exporting content to integrate into VibeAI

---

**🎯 Result:** Your VibeAI app will be live at your custom WordPress domain with professional branding and optimal performance!
