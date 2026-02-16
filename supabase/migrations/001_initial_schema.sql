-- Tet Greeting Tree Database Schema

-- Tree members table
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  relationship TEXT,
  category TEXT NOT NULL CHECK (category IN ('family', 'friends', 'community')),
  parent_id UUID REFERENCES members(id) ON DELETE SET NULL,
  video_filename TEXT,
  position_x FLOAT DEFAULT 0,
  position_y FLOAT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Photos captured by visitors
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  captured_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Allow public read access to members
CREATE POLICY "Members are viewable by everyone"
  ON members FOR SELECT
  USING (true);

-- Allow public read access to photos
CREATE POLICY "Photos are viewable by everyone"
  ON photos FOR SELECT
  USING (true);

-- Allow public insert for photos (visitors can upload)
CREATE POLICY "Anyone can upload photos"
  ON photos FOR INSERT
  WITH CHECK (true);

-- Create photos storage bucket
-- Note: Run this in Supabase Dashboard > Storage > Create new bucket
-- Bucket name: photos
-- Public bucket: Yes

-- Sample data for testing
INSERT INTO members (name, relationship, category, video_filename) VALUES
  ('Me', 'Self', 'family', 'greeting-me.mp4');

-- Get the ID of the root member for parent references
DO $$
DECLARE
  root_id UUID;
  mom_id UUID;
  dad_id UUID;
BEGIN
  SELECT id INTO root_id FROM members WHERE name = 'Me';

  -- Parents
  INSERT INTO members (name, relationship, category, parent_id, video_filename) VALUES
    ('Mom', 'Mother', 'family', root_id, 'greeting-mom.mp4')
  RETURNING id INTO mom_id;

  INSERT INTO members (name, relationship, category, parent_id, video_filename) VALUES
    ('Dad', 'Father', 'family', root_id, 'greeting-dad.mp4')
  RETURNING id INTO dad_id;

  -- Grandparents
  INSERT INTO members (name, relationship, category, parent_id, video_filename) VALUES
    ('Grandma (Maternal)', 'Grandmother', 'family', mom_id, 'greeting-grandma-maternal.mp4'),
    ('Grandpa (Maternal)', 'Grandfather', 'family', mom_id, 'greeting-grandpa-maternal.mp4'),
    ('Grandma (Paternal)', 'Grandmother', 'family', dad_id, 'greeting-grandma-paternal.mp4'),
    ('Grandpa (Paternal)', 'Grandfather', 'family', dad_id, 'greeting-grandpa-paternal.mp4');

  -- Friends and community (separate branches from root)
  INSERT INTO members (name, relationship, category, parent_id, video_filename) VALUES
    ('Close Friends', 'Friends', 'friends', root_id, 'greeting-friends.mp4'),
    ('Work Team', 'Community', 'community', root_id, 'greeting-work.mp4');
END $$;
