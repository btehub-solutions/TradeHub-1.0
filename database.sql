-- ═══════════════════════════════════════════════════════════════
-- TRADEHUB DATABASE SETUP
-- ═══════════════════════════════════════════════════════════════
-- Run this SQL in your Supabase SQL Editor
-- Go to: https://app.supabase.com → Your Project → SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Create the listings table
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

-- Enable Row Level Security
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view listings (no authentication required)
CREATE POLICY "Anyone can view listings" ON listings
  FOR SELECT USING (true);

-- Policy: Anyone can insert listings (no authentication required)
CREATE POLICY "Anyone can insert listings" ON listings
  FOR INSERT WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════
-- OPTIONAL: Add some sample data for testing
-- ═══════════════════════════════════════════════════════════════

-- Sample Listing 1: iPhone
INSERT INTO listings (title, description, price, location, seller_name, seller_phone, image_url)
VALUES (
  'iPhone 12 Pro Max 128GB',
  'Barely used iPhone 12 Pro Max in excellent condition. Comes with original box, charger, and case. No scratches on screen. Battery health at 95%.',
  250000,
  'Lagos, Ikeja',
  'Chidi Okafor',
  '+2348012345678',
  'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=500'
);

-- Sample Listing 2: Laptop
INSERT INTO listings (title, description, price, location, seller_name, seller_phone, image_url)
VALUES (
  'HP Pavilion Laptop - Core i5, 8GB RAM',
  'Used HP Pavilion laptop in good working condition. Perfect for students and office work. Comes with charger and laptop bag.',
  120000,
  'Abuja, Wuse',
  'Amina Ibrahim',
  '+2348098765432',
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500'
);

-- Sample Listing 3: Furniture
INSERT INTO listings (title, description, price, location, seller_name, seller_phone, image_url)
VALUES (
  'Modern 3-Seater Sofa',
  'Beautiful grey 3-seater sofa in excellent condition. Very comfortable and clean. Selling due to relocation. Buyer must arrange pickup.',
  85000,
  'Port Harcourt, GRA',
  'Tunde Adeyemi',
  '+2347011223344',
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500'
);

-- Sample Listing 4: Electronics
INSERT INTO listings (title, description, price, location, seller_name, seller_phone, image_url)
VALUES (
  'Samsung 43" Smart TV',
  'Samsung 43-inch Smart TV with Netflix, YouTube, and other apps. Excellent picture quality. Comes with remote and wall mount.',
  150000,
  'Ibadan, Bodija',
  'Ngozi Eze',
  '+2348055667788',
  'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500'
);

-- Sample Listing 5: Fashion
INSERT INTO listings (title, description, price, location, seller_name, seller_phone, image_url)
VALUES (
  'Designer Leather Handbag',
  'Authentic designer leather handbag in brown. Used only a few times. Perfect condition with dust bag included.',
  45000,
  'Lagos, Victoria Island',
  'Blessing Okoro',
  '+2348123456789',
  'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500'
);

-- ═══════════════════════════════════════════════════════════════
-- VERIFICATION QUERIES
-- ═══════════════════════════════════════════════════════════════

-- Check if table was created successfully
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'listings';

-- View all listings
SELECT * FROM listings ORDER BY created_at DESC;

-- Count total listings
SELECT COUNT(*) as total_listings FROM listings;

-- Check Row Level Security policies
SELECT * FROM pg_policies WHERE tablename = 'listings';

-- ═══════════════════════════════════════════════════════════════
-- NOTES
-- ═══════════════════════════════════════════════════════════════
-- 
-- 1. The sample data is optional - you can skip it if you want to
--    start with an empty database
--
-- 2. Image URLs use Unsplash for demo purposes. In production,
--    users will paste their own image URLs
--
-- 3. Phone numbers in sample data are fake - use real numbers
--    when testing WhatsApp functionality
--
-- 4. Row Level Security is enabled but set to public access
--    (anyone can read/write). This is intentional for the MVP.
--
-- 5. To reset the database, you can drop and recreate:
--    DROP TABLE IF EXISTS listings CASCADE;
--    (Then run this script again)
--
-- ═══════════════════════════════════════════════════════════════
