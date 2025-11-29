-- ============================================================================
-- TradeHub Enhancement Migration - Phase 1: Image Upload System
-- ============================================================================
-- This migration adds support for multiple image uploads with Supabase Storage
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- STEP 1: Create Storage Bucket (if not exists)
-- Note: You may need to create this via Supabase Dashboard: Storage > Create Bucket
-- Bucket Name: listing-images
-- Public: YES
-- File size limit: 5MB
-- Allowed MIME types: image/jpeg, image/png, image/webp, image/gif

-- Insert bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'listing-images',
  'listing-images',
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- STEP 2: Storage Policies
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;

-- Policy: Anyone can view images (public bucket)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'listing-images');

-- Policy: Authenticated users can upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'listing-images' 
  AND auth.role() = 'authenticated'
);

-- Policy: Users can update their own images
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'listing-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own images
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'listing-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- STEP 3: Update listings table
-- Add column to track primary image index
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS primary_image_index INTEGER DEFAULT 0;

-- Add index for better query performance on images JSONB column
CREATE INDEX IF NOT EXISTS idx_listings_images ON listings USING gin(images);

-- Add helpful comments
COMMENT ON COLUMN listings.images IS 'Array of image URLs stored in Supabase Storage (JSONB array)';
COMMENT ON COLUMN listings.image_url IS 'Deprecated: Legacy single image URL, kept for backward compatibility. Use images array instead.';
COMMENT ON COLUMN listings.primary_image_index IS 'Index of the primary image in the images array (0-based)';

-- STEP 4: Migration function to move old image_url to images array
-- This ensures backward compatibility for existing listings
DO $$
DECLARE
  listing_record RECORD;
BEGIN
  FOR listing_record IN 
    SELECT id, image_url 
    FROM listings 
    WHERE image_url IS NOT NULL 
    AND (images IS NULL OR jsonb_array_length(images) = 0)
  LOOP
    UPDATE listings
    SET images = jsonb_build_array(listing_record.image_url)
    WHERE id = listing_record.id;
  END LOOP;
END $$;

-- STEP 5: Create helper function to get primary image
CREATE OR REPLACE FUNCTION get_primary_image(listing_id UUID)
RETURNS TEXT AS $$
DECLARE
  listing_images JSONB;
  primary_index INTEGER;
BEGIN
  SELECT images, primary_image_index 
  INTO listing_images, primary_index
  FROM listings 
  WHERE id = listing_id;
  
  IF listing_images IS NULL OR jsonb_array_length(listing_images) = 0 THEN
    RETURN NULL;
  END IF;
  
  IF primary_index >= jsonb_array_length(listing_images) THEN
    primary_index := 0;
  END IF;
  
  RETURN listing_images->primary_index->>0;
END;
$$ LANGUAGE plpgsql;

-- STEP 6: Verification queries
-- Run these to verify the migration was successful

-- Check if bucket exists
SELECT * FROM storage.buckets WHERE id = 'listing-images';

-- Check storage policies
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- Check listings table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'listings' 
AND column_name IN ('images', 'image_url', 'primary_image_index')
ORDER BY ordinal_position;

-- Check if images were migrated
SELECT 
  COUNT(*) as total_listings,
  COUNT(CASE WHEN images IS NOT NULL AND jsonb_array_length(images) > 0 THEN 1 END) as with_images,
  COUNT(CASE WHEN image_url IS NOT NULL THEN 1 END) as with_legacy_url
FROM listings;

-- ============================================================================
-- Migration Complete!
-- ============================================================================
-- Next steps:
-- 1. Test image upload in your application
-- 2. Verify images are being stored in the listing-images bucket
-- 3. Check that RLS policies are working correctly
-- ============================================================================
