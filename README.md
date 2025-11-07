# 🛒 TradeHub

A simple marketplace app for buying and selling used items in Nigeria. Built with Next.js 15, TypeScript, Tailwind CSS, and Supabase.

## Features

- 📱 Browse all listings in a responsive grid
- 👁️ View detailed listing information
- ➕ Post new items without authentication
- 💬 Contact sellers directly via WhatsApp
- 🚀 Fast and modern UI

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works fine)

### 1. Clone and Install

```bash
cd tradehub
npm install
```

### 2. Set Up Supabase Database

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor and run this query:

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

### 3. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in your Supabase credentials:
   - Go to your Supabase project settings
   - Copy the Project URL and Anon Key
   - Paste them into `.env.local`

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
tradehub/
├── app/
│   ├── api/
│   │   └── listings/
│   │       ├── route.ts          # GET all & POST new listings
│   │       └── [id]/route.ts     # GET single listing
│   ├── listings/
│   │   ├── new/page.tsx          # Post new item form
│   │   └── [id]/page.tsx         # Single listing view
│   ├── layout.tsx                # Root layout with header
│   ├── page.tsx                  # Homepage (browse listings)
│   └── globals.css               # Global styles
├── components/
│   ├── Header.tsx                # Navigation header
│   └── ListingCard.tsx           # Listing card component
├── lib/
│   └── supabase.ts               # Supabase client
├── types/
│   └── listing.ts                # TypeScript types
└── package.json
```

## Deployment to Vercel

1. Push your code to GitHub

2. Go to [vercel.com](https://vercel.com) and import your repository

3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_BASE_URL` (your Vercel URL)

4. Deploy!

## Features Not Included (By Design)

This is an MVP focused on simplicity:

- ❌ No user authentication
- ❌ No user profiles
- ❌ No image uploads (just paste URLs)
- ❌ No categories or filters
- ❌ No edit/delete functionality

These can be added later as the app grows!

## License

MIT

## Contributing

Feel free to open issues or submit PRs to improve TradeHub!
