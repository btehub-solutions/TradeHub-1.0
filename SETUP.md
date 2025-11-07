# TradeHub Setup Instructions

## Step 1: Install Dependencies

Since you're on Windows with PowerShell execution policy restrictions, you have two options:

### Option A: Temporarily Allow Script Execution (Recommended)
Open PowerShell as Administrator and run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then install dependencies:
```bash
npm install
```

### Option B: Use Command Prompt Instead
Open Command Prompt (cmd.exe) and run:
```bash
npm install
```

## Step 2: Set Up Supabase

1. Go to [https://supabase.com](https://supabase.com) and create a free account
2. Create a new project (choose a region close to Nigeria, like Europe)
3. Wait for the project to finish setting up (~2 minutes)

## Step 3: Create Database Table

1. In your Supabase project, click on "SQL Editor" in the left sidebar
2. Click "New Query"
3. Copy and paste this SQL:

```sql
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL,
  location TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  seller_phone TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Allow anyone to read and insert (no auth needed)
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view listings" ON listings
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert listings" ON listings
  FOR INSERT WITH CHECK (true);
```

4. Click "Run" to execute the query

## Step 4: Get Your Supabase Credentials

1. In Supabase, click on the "Settings" icon (gear) in the left sidebar
2. Click on "API" under Project Settings
3. You'll see two important values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

## Step 5: Configure Environment Variables

1. In your project folder, copy `.env.local.example` to `.env.local`:
   ```bash
   copy .env.local.example .env.local
   ```

2. Open `.env.local` in your editor and replace the placeholder values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 6: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

## Step 7: Test the App

1. Click "Post Item" to create a test listing
2. Fill in the form (use a real WhatsApp number if you want to test the contact feature)
3. For the image URL, you can use a sample image like:
   ```
   https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500
   ```
4. Submit the form and verify the listing appears on the homepage

## Troubleshooting

### "Cannot find module" errors
Run `npm install` to install all dependencies.

### Database connection errors
- Verify your `.env.local` file has the correct Supabase URL and key
- Make sure you've created the `listings` table in Supabase
- Check that Row Level Security policies are enabled

### Port 3000 already in use
Stop any other Next.js apps running, or use a different port:
```bash
npm run dev -- -p 3001
```

## Next Steps

Once everything works locally:
1. Push your code to GitHub
2. Deploy to Vercel (see README.md for instructions)
3. Add your Supabase credentials as environment variables in Vercel
4. Share your app with users in Nigeria! 🇳🇬
