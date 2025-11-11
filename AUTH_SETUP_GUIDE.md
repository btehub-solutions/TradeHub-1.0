# TradeHub Authentication & Seller Dashboard Setup Guide

## 🎯 Overview
This guide will help you set up email/password authentication and the seller dashboard for TradeHub.

## ✅ What's Been Added

### New Features
- ✅ Email/password authentication (sign up, sign in, sign out)
- ✅ Protected routes (only authenticated users can post/manage listings)
- ✅ Seller Dashboard to view and manage own listings
- ✅ Edit, delete, and mark listings as sold
- ✅ User-specific listing management
- ✅ Status tracking (available/sold)

### New Files Created
- `/lib/AuthProvider.tsx` - Authentication context provider
- `/app/auth/signup/page.tsx` - Sign up page
- `/app/auth/signin/page.tsx` - Sign in page
- `/app/dashboard/page.tsx` - Seller dashboard
- `database-auth-migration.sql` - Database migration script

### Updated Files
- `/lib/supabase.ts` - Added auth helpers and updated types
- `/app/layout.tsx` - Wrapped with AuthProvider
- `/components/Header.tsx` - Shows auth status
- `/app/listings/new/page.tsx` - Requires authentication
- `/app/api/listings/route.ts` - Handles user_id and status filtering

## 📋 Setup Steps

### Step 1: Run Database Migration

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Open the file `database-auth-migration.sql`
4. Copy all the SQL code
5. Paste it into the SQL Editor
6. Click **Run** to execute the migration

This will:
- Add `user_id` column to link listings to users
- Add `status` column to track available/sold items
- Create indexes for better performance
- Update Row Level Security (RLS) policies

### Step 2: Enable Email Authentication in Supabase

1. Go to **Authentication** → **Providers** in Supabase Dashboard
2. Find **Email** provider
3. Toggle it **ON** (should be enabled by default)
4. Click **Save**

### Step 3: Configure Email Settings (Optional for Testing)

**For Development/Testing (Skip Email Verification):**
1. Go to **Authentication** → **Settings**
2. Scroll to **Email Auth** section
3. Toggle **OFF** "Enable email confirmations"
4. This allows instant signup without email verification

**For Production (Recommended):**
- Keep email confirmations **ON**
- Customize email templates in **Email Templates** section
- Configure SMTP settings if needed

### Step 4: Configure Site URL

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to:
   - Development: `http://localhost:3000`
   - Production: Your Vercel domain (e.g., `https://tradehub.vercel.app`)
3. Set **Redirect URLs** to:
   - Development: `http://localhost:3000/**`
   - Production: `https://yourdomain.vercel.app/**`

### Step 5: Test Locally

```bash
# Make sure dependencies are installed
npm install

# Run the development server
npm run dev
```

Open http://localhost:3000

## 🧪 Testing Checklist

### Authentication Flow
- [ ] Visit http://localhost:3000
- [ ] Click **Sign Up** in header
- [ ] Create account with email/password
- [ ] Sign in with credentials
- [ ] Header shows your email and **Sign Out** button
- [ ] Sign out works and redirects to homepage

### Posting Listings
- [ ] Try to access `/listings/new` without login → redirects to signin
- [ ] Sign in, then access `/listings/new` → form loads
- [ ] Fill form and submit → listing created
- [ ] Redirected to dashboard after posting
- [ ] New listing appears in dashboard

### Seller Dashboard
- [ ] Dashboard shows all your listings
- [ ] Can click **Edit** to modify listing
- [ ] Save changes works
- [ ] Cancel edit works
- [ ] Can mark listing as **Sold**
- [ ] Sold listings show "SOLD" badge
- [ ] Edit/Delete disabled for sold listings
- [ ] Can delete listing with confirmation
- [ ] Empty state shows when no listings

### Homepage
- [ ] Homepage shows only available listings (not sold)
- [ ] Sold items don't appear in browse
- [ ] Category filters work
- [ ] Search works

## 🔧 Troubleshooting

### Issue: "User authentication required" error when posting
**Solution:** Make sure you're signed in. The app requires authentication to post listings.

### Issue: Can't sign up or sign in
**Solution:** 
1. Check that Email provider is enabled in Supabase
2. Verify your Supabase credentials in `.env.local`
3. Make sure Supabase project is not paused

### Issue: Listings not showing in dashboard
**Solution:**
1. Check that the listing was created with your user_id
2. Verify RLS policies are set up correctly
3. Check browser console for errors

### Issue: "Failed to load your listings"
**Solution:**
1. Ensure database migration was run successfully
2. Check that `user_id` and `status` columns exist in listings table
3. Verify RLS policies allow users to view their own listings

## 📝 Optional: Update Existing Listings

If you have existing demo listings without a user_id, you can assign them to your account:

1. Create a test account and sign in
2. Go to Supabase Dashboard → **Authentication** → **Users**
3. Copy your User ID
4. Go to **SQL Editor** and run:

```sql
UPDATE listings 
SET user_id = 'YOUR_USER_ID_HERE', status = 'available' 
WHERE user_id IS NULL;
```

Replace `YOUR_USER_ID_HERE` with your actual user ID.

## 🚀 Deployment to Vercel

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy
5. Update Supabase Site URL and Redirect URLs to your Vercel domain
6. Test on production!

## 📚 Key Features Summary

### For Users
- **Sign Up/Sign In**: Create account with email and password
- **Post Listings**: Only authenticated users can post items
- **Manage Listings**: Edit, delete, or mark items as sold
- **Dashboard**: View all your listings in one place
- **Status Tracking**: Keep track of available vs sold items

### For Developers
- **Auth Context**: Global authentication state with `useAuth()` hook
- **Protected Routes**: Automatic redirect to signin for unauthenticated users
- **RLS Policies**: Secure database access with Row Level Security
- **Type Safety**: Full TypeScript support with updated types

## 🎉 You're All Set!

Your TradeHub marketplace now has:
- 🔐 User authentication
- 📊 Seller dashboard
- ✏️ CRUD operations for listings
- 🏷️ Status management (available/sold)
- 🔒 Secure, user-specific data access

Happy trading! 🚀
