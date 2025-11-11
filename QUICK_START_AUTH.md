# 🚀 TradeHub Authentication - Quick Start

## ⚡ 3-Minute Setup

### Step 1: Run Database Migration (2 minutes)
1. Open Supabase Dashboard → **SQL Editor**
2. Open `database-auth-migration.sql` in your project
3. Copy all SQL code
4. Paste into SQL Editor
5. Click **Run**

### Step 2: Enable Email Auth (30 seconds)
1. Supabase Dashboard → **Authentication** → **Providers**
2. Toggle **Email** provider **ON**
3. Click **Save**

### Step 3: Configure for Testing (30 seconds)
1. **Authentication** → **Settings**
2. Find "Enable email confirmations"
3. Toggle **OFF** (for testing without email verification)

### Step 4: Test It! (1 minute)
```bash
npm run dev
```

1. Go to http://localhost:3000
2. Click **Sign Up**
3. Create account (email + password)
4. Sign in
5. Click **Post Item**
6. Fill form and submit
7. View in **Dashboard**

## ✅ That's It!

You now have:
- 🔐 User authentication
- 📊 Seller dashboard
- ✏️ Edit/delete listings
- 🏷️ Mark items as sold

## 📖 Need More Details?

See **AUTH_SETUP_GUIDE.md** for:
- Detailed setup instructions
- Troubleshooting guide
- Production deployment
- Complete testing checklist

## 🎯 Key Pages

- **Sign Up**: http://localhost:3000/auth/signup
- **Sign In**: http://localhost:3000/auth/signin
- **Dashboard**: http://localhost:3000/dashboard
- **Post Item**: http://localhost:3000/listings/new

## 🔑 Environment Variables

Make sure these are in your `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🐛 Quick Troubleshooting

**Can't sign up?**
- Check Email provider is enabled in Supabase

**"User authentication required" error?**
- Make sure you're signed in

**Listings not showing in dashboard?**
- Verify database migration ran successfully

## 📚 Files to Know

- `database-auth-migration.sql` - Run this in Supabase
- `AUTH_SETUP_GUIDE.md` - Complete setup guide
- `AUTHENTICATION_IMPLEMENTATION.md` - Technical details

---

**Ready to trade! 🎉**
