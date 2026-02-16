-- Migration: Update family tree with Vietnamese names and new members
-- This migration safely updates existing records to preserve photo associations

-- Step 1: Update existing member names (photos stay attached via member_id UUID)
UPDATE members SET name = 'Mẹ' WHERE name = 'Mom';
UPDATE members SET name = 'Ba' WHERE name = 'Dad';
UPDATE members SET name = 'Bà Ngoại' WHERE name = 'Grandma (Maternal)';
UPDATE members SET name = 'Ông Ngoại' WHERE name = 'Grandpa (Maternal)';
UPDATE members SET name = 'Bà Nội' WHERE name = 'Grandma (Paternal)';
UPDATE members SET name = 'Ông Nội' WHERE name = 'Grandpa (Paternal)';

-- Step 2: Delete removed members (this will CASCADE delete their photos)
DELETE FROM members WHERE name = 'Close Friends';
DELETE FROM members WHERE name = 'Work Team';

-- Step 3: Add new members
DO $$
DECLARE
  root_id UUID;
  mom_id UUID;
  dad_id UUID;
  ong_ngoai_id UUID;
  ba_noi_id UUID;
  ong_noi_id UUID;
BEGIN
  -- Get existing member IDs
  SELECT id INTO root_id FROM members WHERE name = 'Me';
  SELECT id INTO mom_id FROM members WHERE name = 'Mẹ';
  SELECT id INTO dad_id FROM members WHERE name = 'Ba';
  SELECT id INTO ong_ngoai_id FROM members WHERE name = 'Ông Ngoại';
  SELECT id INTO ba_noi_id FROM members WHERE name = 'Bà Nội';
  SELECT id INTO ong_noi_id FROM members WHERE name = 'Ông Nội';

  -- Below Me
  INSERT INTO members (name, relationship, category, parent_id, video_filename)
  SELECT 'Lớp Vào Đời', 'Community', 'community', root_id, NULL
  WHERE NOT EXISTS (SELECT 1 FROM members WHERE name = 'Lớp Vào Đời');

  -- Below Mẹ
  INSERT INTO members (name, relationship, category, parent_id, video_filename)
  SELECT 'Cậu Hai', 'Uncle', 'family', mom_id, NULL
  WHERE NOT EXISTS (SELECT 1 FROM members WHERE name = 'Cậu Hai');

  INSERT INTO members (name, relationship, category, parent_id, video_filename)
  SELECT 'Cô Ngọc', 'Aunt', 'family', mom_id, NULL
  WHERE NOT EXISTS (SELECT 1 FROM members WHERE name = 'Cô Ngọc');

  INSERT INTO members (name, relationship, category, parent_id, video_filename)
  SELECT 'Nhi', 'Cousin', 'family', mom_id, NULL
  WHERE NOT EXISTS (SELECT 1 FROM members WHERE name = 'Nhi');

  INSERT INTO members (name, relationship, category, parent_id, video_filename)
  SELECT 'Khôi', 'Cousin', 'family', mom_id, NULL
  WHERE NOT EXISTS (SELECT 1 FROM members WHERE name = 'Khôi');

  -- Below Ông Ngoại
  INSERT INTO members (name, relationship, category, parent_id, video_filename)
  SELECT 'Gia đình bác Trí', 'Extended Family', 'family', ong_ngoai_id, NULL
  WHERE NOT EXISTS (SELECT 1 FROM members WHERE name = 'Gia đình bác Trí');

  -- Below Ba
  INSERT INTO members (name, relationship, category, parent_id, video_filename)
  SELECT 'Cô Nga', 'Aunt', 'family', dad_id, NULL
  WHERE NOT EXISTS (SELECT 1 FROM members WHERE name = 'Cô Nga');

  -- Below Ông Nội
  INSERT INTO members (name, relationship, category, parent_id, video_filename)
  SELECT 'Bà Hồng', 'Extended Family', 'family', ong_noi_id, NULL
  WHERE NOT EXISTS (SELECT 1 FROM members WHERE name = 'Bà Hồng');

  -- Below Bà Nội
  INSERT INTO members (name, relationship, category, parent_id, video_filename)
  SELECT 'Bà Trà', 'Extended Family', 'family', ba_noi_id, NULL
  WHERE NOT EXISTS (SELECT 1 FROM members WHERE name = 'Bà Trà');

  INSERT INTO members (name, relationship, category, parent_id, video_filename)
  SELECT 'Gia đình bà Trinh', 'Extended Family', 'family', ba_noi_id, NULL
  WHERE NOT EXISTS (SELECT 1 FROM members WHERE name = 'Gia đình bà Trinh');

  INSERT INTO members (name, relationship, category, parent_id, video_filename)
  SELECT 'Gia đình bà Nhàn', 'Extended Family', 'family', ba_noi_id, NULL
  WHERE NOT EXISTS (SELECT 1 FROM members WHERE name = 'Gia đình bà Nhàn');

  INSERT INTO members (name, relationship, category, parent_id, video_filename)
  SELECT 'Gia đình bà Ngân', 'Extended Family', 'family', ba_noi_id, NULL
  WHERE NOT EXISTS (SELECT 1 FROM members WHERE name = 'Gia đình bà Ngân');
END $$;
