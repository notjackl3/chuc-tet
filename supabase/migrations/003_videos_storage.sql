-- Create videos storage bucket and policies
-- Run this in Supabase SQL Editor

-- Note: Storage bucket creation must be done via Dashboard or API
-- Go to Supabase Dashboard > Storage > Create new bucket
-- Bucket name: videos
-- Public bucket: Yes

-- Allow public read access to videos
CREATE POLICY "Videos are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'videos');

-- Allow public upload to videos bucket
CREATE POLICY "Anyone can upload videos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'videos');

-- Allow public update to videos bucket
CREATE POLICY "Anyone can update videos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'videos');

-- Allow public delete from videos bucket
CREATE POLICY "Anyone can delete videos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'videos');

-- Add policy for members table to allow inserts
CREATE POLICY "Anyone can insert members"
  ON members FOR INSERT
  WITH CHECK (true);

-- Add policy for members table to allow updates
CREATE POLICY "Anyone can update members"
  ON members FOR UPDATE
  USING (true);

-- Add policy for members table to allow deletes
CREATE POLICY "Anyone can delete members"
  ON members FOR DELETE
  USING (true);
