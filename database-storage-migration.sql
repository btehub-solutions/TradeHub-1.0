-- TradeHub Storage Migration for Image Uploads
-- Run this in Supabase SQL Editor

-- Step 1: Create storage bucket for listing images
-- Note: This needs to be done via Supabase Dashboard or API
-- Go to Storage > Create Bucket > Name: "listing-images" > Public bucket: YES

-- Step 2: Set up storage policies
-- Allow authenticated users to upload images
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-images', 'listing-images', true)
ON CONFLICT (id) DO NOTHING;

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

-- Step 3: Update listings table to better support multiple images
-- The 'images' column already exists as JSONB, so we just need to ensure it's being used
-- Add a column to track primary image index
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS primary_image_index INTEGER DEFAULT 0;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_listings_images ON listings USING gin(images);

-- Step 4: Create a function to clean up orphaned images when listing is deleted
CREATE OR REPLACE FUNCTION delete_listing_images()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete all images associated with this listing from storage
  -- This will be handled by the application layer for now
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (optional - can be handled in application)
DROP TRIGGER IF EXISTS cleanup_listing_images ON listings;
CREATE TRIGGER cleanup_listing_images
  BEFORE DELETE ON listings
  FOR EACH ROW
  EXECUTE FUNCTION delete_listing_images();

-- Step 5: Add helpful comments
COMMENT ON COLUMN listings.images IS 'Array of image URLs stored in Supabase Storage';
COMMENT ON COLUMN listings.image_url IS 'Deprecated: Legacy single image URL, kept for backward compatibility';
COMMENT ON COLUMN listings.primary_image_index IS 'Index of the primary image in the images array';
