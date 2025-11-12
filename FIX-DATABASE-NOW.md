# 🚨 URGENT: Fix Your Database Now

## The Problem
Your Supabase database table structure doesn't match what the app needs. This causes "column not found" errors.

## ⚡ FASTEST FIX (1 minute) - Recreate Table

**WARNING: This deletes all existing listings!** If you have important data, use Option 2 instead.

### Step 1: Go to Supabase
1. Open https://supabase.com
2. Log in to your account
3. Select your TradeHub project

### Step 2: Open SQL Editor
1. Click **SQL Editor** in the left sidebar
2. Click **New Query**

### Step 3: Copy & Paste This SQL
```sql
-- Drop and recreate the table with correct structure
DROP TABLE IF EXISTS listings CASCADE;

CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL,
  location TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  seller_phone TEXT NOT NULL,
  category TEXT DEFAULT 'Other',
  image_url TEXT,
  images JSONB,
  user_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'available',
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_listings_user_id ON listings(user_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_category ON listings(category);
CREATE INDEX idx_listings_created_at ON listings(created_at DESC);

CREATE POLICY "Anyone can view available listings" ON listings
  FOR SELECT USING (status = 'available' OR user_id = auth.uid());

CREATE POLICY "Authenticated users can insert listings" ON listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings" ON listings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listings" ON listings
  FOR DELETE USING (auth.uid() = user_id);
```

### Step 4: Run It
1. Click the **Run** button (or press Ctrl+Enter)
2. Wait for "Success. No rows returned" message
3. **IMPORTANT:** Go to your Supabase project settings and click "Restart" to refresh the schema cache

### Step 5: Restart Your Dev Server
1. In your terminal, press `Ctrl+C` to stop the server
2. Run `npm run dev` again
3. Go to http://localhost:3001

### Step 6: Test Your App
1. Sign in to your account
2. Try creating a listing
3. ✅ It should work now!

## Still Having Issues?

If you see any errors when running the SQL:
1. Make sure you're in the correct project
2. Check that the `listings` table exists
3. Try running each ALTER TABLE command one at a time

## Need Help?
The error message will tell you exactly what's wrong. Share it and I'll help fix it.
