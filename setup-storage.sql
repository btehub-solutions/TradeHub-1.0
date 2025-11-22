-- Create the 'listings' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('listings', 'listings', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to view files in the 'listings' bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'listings' );

-- Allow authenticated users to upload files to the 'listings' bucket
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'listings' AND
  auth.role() = 'authenticated'
);

-- Allow users to update their own files (optional, but good for edits)
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'listings' AND
  auth.uid() = owner
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'listings' AND
  auth.uid() = owner
);
