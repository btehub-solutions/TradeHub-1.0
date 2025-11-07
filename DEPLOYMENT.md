# TradeHub Deployment Guide

Complete guide to deploying your TradeHub app to production on Vercel.

## Prerequisites

Before deploying, ensure:
- ✅ App works locally (`npm run dev`)
- ✅ Supabase database is set up
- ✅ All features tested and working
- ✅ Code is committed to Git

## Option 1: Deploy via Vercel Dashboard (Recommended)

### Step 1: Push to GitHub

1. **Create GitHub Repository**
   ```bash
   # Go to github.com and create a new repository named "tradehub"
   # Don't initialize with README (we already have one)
   ```

2. **Initialize Git (if not done)**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - TradeHub marketplace"
   ```

3. **Connect to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/tradehub.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy to Vercel

1. **Go to Vercel**
   - Visit https://vercel.com
   - Sign up/Sign in with your GitHub account

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select your GitHub repository "tradehub"
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `.next` (auto-filled)

4. **Add Environment Variables**
   Click "Environment Variables" and add:
   
   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
   | `NEXT_PUBLIC_BASE_URL` | (Leave empty for now) |

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - You'll get a URL like: `https://tradehub-xyz.vercel.app`

### Step 3: Update Base URL

1. Copy your production URL from Vercel
2. Go back to Vercel project settings
3. Add environment variable:
   - Name: `NEXT_PUBLIC_BASE_URL`
   - Value: `https://your-app.vercel.app`
4. Redeploy (Vercel will do this automatically)

### Step 4: Test Production

Visit your production URL and test:
- ✅ Homepage loads
- ✅ Listings display correctly
- ✅ Can create new listing
- ✅ Can view listing details
- ✅ WhatsApp button works
- ✅ Images load properly

## Option 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login

```bash
vercel login
```

### Step 3: Deploy

```bash
# From project directory
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? tradehub
# - Directory? ./
# - Override settings? No
```

### Step 4: Add Environment Variables

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Paste your Supabase URL when prompted

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Paste your Supabase anon key when prompted

vercel env add NEXT_PUBLIC_BASE_URL
# Paste your Vercel URL when prompted
```

### Step 5: Deploy to Production

```bash
vercel --prod
```

## Custom Domain (Optional)

### Step 1: Buy Domain
- Purchase domain from Namecheap, GoDaddy, or any registrar
- Example: `tradehub.ng` or `tradehub.com.ng`

### Step 2: Add to Vercel
1. Go to Vercel project settings
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

### Step 3: Update DNS
Add these records at your domain registrar:

**For root domain (tradehub.ng):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Step 4: Wait for Propagation
- DNS changes take 1-48 hours
- Vercel will auto-issue SSL certificate
- Your site will be live at your custom domain

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL | `https://abc123.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key | `eyJhbGc...` |
| `NEXT_PUBLIC_BASE_URL` | No | Production URL for API calls | `https://tradehub.vercel.app` |

## Continuous Deployment

Once set up, Vercel automatically deploys when you push to GitHub:

```bash
# Make changes to your code
git add .
git commit -m "Add new feature"
git push origin main

# Vercel automatically:
# 1. Detects the push
# 2. Builds your app
# 3. Deploys to production
# 4. Updates your live site
```

## Deployment Checklist

Before going live:

- [ ] All features tested locally
- [ ] Environment variables configured
- [ ] Supabase database has RLS policies
- [ ] Images load from valid URLs
- [ ] WhatsApp links work correctly
- [ ] Mobile responsive design verified
- [ ] No console errors
- [ ] README.md updated with production URL
- [ ] Privacy policy added (if collecting user data)
- [ ] Terms of service added (optional)

## Post-Deployment Tasks

### 1. Monitor Performance
- Check Vercel Analytics dashboard
- Monitor Supabase database usage
- Track API response times

### 2. Set Up Monitoring
- Enable Vercel Analytics (free tier available)
- Set up Supabase alerts for database limits
- Monitor error logs in Vercel dashboard

### 3. Optimize
- Enable Vercel Image Optimization
- Add caching headers if needed
- Optimize database queries

### 4. Security
- Review Supabase RLS policies
- Check for exposed API keys
- Enable HTTPS only (Vercel does this automatically)

## Scaling Considerations

### Free Tier Limits

**Vercel Free Tier:**
- 100GB bandwidth/month
- Unlimited requests
- Automatic SSL
- Edge network CDN

**Supabase Free Tier:**
- 500MB database
- 2GB bandwidth
- 50,000 monthly active users
- Unlimited API requests

### When to Upgrade

Upgrade when you reach:
- 10,000+ listings
- 50,000+ monthly visitors
- Need for advanced features
- Require better support

### Upgrade Path

1. **Supabase Pro** ($25/month)
   - 8GB database
   - 50GB bandwidth
   - Daily backups
   - Email support

2. **Vercel Pro** ($20/month)
   - 1TB bandwidth
   - Advanced analytics
   - Password protection
   - Priority support

## Troubleshooting Deployment

### Build Fails

**Error: "Module not found"**
```bash
# Solution: Ensure all dependencies in package.json
npm install
git add package-lock.json
git commit -m "Update dependencies"
git push
```

**Error: "Environment variable not found"**
- Check Vercel dashboard → Settings → Environment Variables
- Ensure variables are set for Production environment
- Redeploy after adding variables

### Runtime Errors

**Error: "Failed to fetch"**
- Check `NEXT_PUBLIC_BASE_URL` is set correctly
- Verify Supabase credentials are correct
- Check Supabase project is not paused

**Images Not Loading**
- Verify image URLs are publicly accessible
- Check `next.config.ts` has correct remote patterns
- Ensure images are served over HTTPS

### Performance Issues

**Slow Page Loads**
- Enable Vercel Analytics to identify bottlenecks
- Check Supabase query performance
- Add database indexes if needed
- Consider implementing pagination

## Rollback Strategy

If deployment has issues:

### Quick Rollback (Vercel Dashboard)
1. Go to Vercel project
2. Click "Deployments"
3. Find previous working deployment
4. Click "..." → "Promote to Production"

### Rollback via CLI
```bash
vercel rollback
```

### Rollback via Git
```bash
git revert HEAD
git push origin main
```

## Maintenance

### Regular Tasks

**Weekly:**
- Check error logs in Vercel
- Monitor Supabase usage
- Review user feedback

**Monthly:**
- Update dependencies: `npm update`
- Review and optimize database
- Check for security updates

**Quarterly:**
- Analyze usage patterns
- Plan new features
- Review hosting costs

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Support**: https://vercel.com/support
- **Supabase Docs**: https://supabase.com/docs
- **Supabase Support**: https://supabase.com/support
- **Next.js Docs**: https://nextjs.org/docs

## Success Metrics

Track these metrics post-deployment:

- **Traffic**: Daily/monthly visitors
- **Engagement**: Listings created per day
- **Performance**: Page load time < 2 seconds
- **Errors**: Error rate < 0.1%
- **Uptime**: 99.9% availability

---

## Quick Deploy Commands

```bash
# First time deployment
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_URL
git push -u origin main

# Then on Vercel dashboard:
# Import → Add env vars → Deploy

# Future deployments (automatic)
git add .
git commit -m "Your changes"
git push origin main
```

**Your app will be live at**: `https://your-project.vercel.app`

🎉 **Congratulations! Your TradeHub marketplace is now live!**
