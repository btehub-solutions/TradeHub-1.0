# 🚀 TradeHub Deployment Checklist

## ✅ Pre-Deployment Tests (Do These Now)

### 1. Test Authentication
- [ ] Sign Up with new account
  - Go to http://localhost:3001
  - Click "Sign Up"
  - Enter email and password
  - Should redirect to dashboard
  
- [ ] Sign Out
  - Click "Sign Out" button
  - Should return to home page
  
- [ ] Sign In
  - Click "Sign In"
  - Enter credentials
  - Should redirect to dashboard

### 2. Test Listing Creation
- [ ] Create a listing
  - Click "Post Item"
  - Fill in all required fields:
    - Title
    - Description
    - Price
    - Location
    - Your Name
    - WhatsApp Number
  - Select category
  - Upload image (optional)
  - Click "Post Item"
  - Should redirect to dashboard
  - Listing should appear in "My Dashboard"

### 3. Test Listing Display
- [ ] View all listings
  - Go to home page
  - Should see your created listing
  - Image should display correctly
  - Price, location, category should show

- [ ] View single listing
  - Click on a listing
  - Should show full details
  - Contact button should work

### 4. Test Dashboard
- [ ] View my listings
  - Go to dashboard
  - Should see all your listings
  - Edit button should work
  - Delete button should work
  - Mark as Sold should work

### 5. Test Filtering (if implemented)
- [ ] Filter by category
  - Select different categories
  - Listings should filter correctly

---

## 🌐 Vercel Deployment Steps

### Step 1: Prepare for Deployment

1. **Make sure database is set up**
   - [ ] Ran `RUN-THIS-ONCE.sql` in Supabase
   - [ ] Database has all required columns
   - [ ] RLS is disabled

2. **Check environment variables**
   - [ ] `.env.local` has correct Supabase credentials
   - [ ] NEXT_PUBLIC_SUPABASE_URL is set
   - [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY is set

### Step 2: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Ready for deployment"

# Create GitHub repo and push
git remote add origin https://github.com/YOUR-USERNAME/tradehub.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Vercel

1. **Go to Vercel**
   - [ ] Visit https://vercel.com
   - [ ] Sign in with GitHub

2. **Import Project**
   - [ ] Click "New Project"
   - [ ] Select your GitHub repository
   - [ ] Click "Import"

3. **Configure Environment Variables**
   - [ ] Click "Environment Variables"
   - [ ] Add `NEXT_PUBLIC_SUPABASE_URL`
     - Value: Your Supabase URL
   - [ ] Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - Value: Your Supabase anon key

4. **Deploy**
   - [ ] Click "Deploy"
   - [ ] Wait 2-3 minutes
   - [ ] You'll get a URL like: `https://tradehub-xyz.vercel.app`

### Step 4: Update Supabase Settings

1. **Add Vercel URL to Supabase**
   - [ ] Go to Supabase → Authentication → URL Configuration
   - [ ] Add Site URL: `https://your-app.vercel.app`
   - [ ] Add Redirect URL: `https://your-app.vercel.app/**`

### Step 5: Test Production

- [ ] Visit your Vercel URL
- [ ] Test sign up
- [ ] Test sign in
- [ ] Test creating a listing
- [ ] Test viewing listings
- [ ] Test dashboard

---

## 🐛 Common Issues & Fixes

### Issue: "Column not found" error
**Fix:** Run `RUN-THIS-ONCE.sql` in Supabase SQL Editor

### Issue: Sign in redirects back to sign in page
**Fix:** Already fixed with `window.location.href`

### Issue: RLS policy error
**Fix:** Database should have RLS disabled (already done)

### Issue: Build fails on Vercel
**Fix:** Make sure all dependencies are in package.json

### Issue: Environment variables not working
**Fix:** 
1. Go to Vercel project settings
2. Add environment variables
3. Redeploy

---

## 📋 Final Checklist

Before going live:
- [ ] All local tests pass
- [ ] Database is properly configured
- [ ] Code is pushed to GitHub
- [ ] Deployed to Vercel
- [ ] Supabase URLs updated
- [ ] Production tests pass
- [ ] No console errors

---

## 🎉 You're Ready!

Once all checkboxes are complete, your TradeHub marketplace is ready for users!

**Your live URL:** `https://your-project.vercel.app`
