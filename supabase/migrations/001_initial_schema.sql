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
  ba_ngoai_id UUID;
  ong_ngoai_id UUID;
  ba_noi_id UUID;
  ong_noi_id UUID;
BEGIN
  SELECT id INTO root_id FROM members WHERE name = 'Me';

  -- Parents
  INSERT INTO members (name, relationship, category, parent_id, video_filename) VALUES
    ('Mẹ', 'Mother', 'family', root_id, 'greeting-mom.mp4')
  RETURNING id INTO mom_id;

  INSERT INTO members (name, relationship, category, parent_id, video_filename) VALUES
    ('Ba', 'Father', 'family', root_id, 'greeting-dad.mp4')
  RETURNING id INTO dad_id;

  -- Grandparents (Maternal - Ngoại)
  INSERT INTO members (name, relationship, category, parent_id, video_filename) VALUES
    ('Bà Ngoại', 'Grandmother', 'family', mom_id, 'greeting-grandma-maternal.mp4')
  RETURNING id INTO ba_ngoai_id;

  INSERT INTO members (name, relationship, category, parent_id, video_filename) VALUES
    ('Ông Ngoại', 'Grandfather', 'family', mom_id, 'greeting-grandpa-maternal.mp4')
  RETURNING id INTO ong_ngoai_id;

  -- Grandparents (Paternal - Nội)
  INSERT INTO members (name, relationship, category, parent_id, video_filename) VALUES
    ('Bà Nội', 'Grandmother', 'family', dad_id, NULL)
  RETURNING id INTO ba_noi_id;

  INSERT INTO members (name, relationship, category, parent_id, video_filename) VALUES
    ('Ông Nội', 'Grandfather', 'family', dad_id, NULL)
  RETURNING id INTO ong_noi_id;

  -- Below Me
  INSERT INTO members (name, relationship, category, parent_id, video_filename) VALUES
    ('Lớp Vào Đời', 'Community', 'community', root_id, NULL);

  -- Below Mẹ
  INSERT INTO members (name, relationship, category, parent_id, video_filename) VALUES
    ('Cậu Hai', 'Uncle', 'family', mom_id, NULL),
    ('Cô Ngọc', 'Aunt', 'family', mom_id, NULL),
    ('Nhi', 'Cousin', 'family', mom_id, NULL),
    ('Khôi', 'Cousin', 'family', mom_id, NULL);

  -- Below Ông Ngoại
  INSERT INTO members (name, relationship, category, parent_id, video_filename) VALUES
    ('Gia đình bác Trí', 'Extended Family', 'family', ong_ngoai_id, NULL);

  -- Below Ba
  INSERT INTO members (name, relationship, category, parent_id, video_filename) VALUES
    ('Cô Nga', 'Aunt', 'family', dad_id, NULL);

  -- Below Ông Nội
  INSERT INTO members (name, relationship, category, parent_id, video_filename) VALUES
    ('Bà Hồng', 'Extended Family', 'family', ong_noi_id, NULL);

  -- Below Bà Nội
  INSERT INTO members (name, relationship, category, parent_id, video_filename) VALUES
    ('Bà Trà', 'Extended Family', 'family', ba_noi_id, NULL),
    ('Gia đình bà Trinh', 'Extended Family', 'family', ba_noi_id, NULL),
    ('Gia đình bà Nhàn', 'Extended Family', 'family', ba_noi_id, NULL),
    ('Gia đình bà Ngân', 'Extended Family', 'family', ba_noi_id, NULL);
END $$;
