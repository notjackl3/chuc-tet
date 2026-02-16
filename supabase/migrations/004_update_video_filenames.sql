-- Update video_filename based on name (Vietnamese to ASCII conversion)
-- This script converts Vietnamese names to lowercase ASCII with hyphens

-- Create a function to convert Vietnamese characters to ASCII
CREATE OR REPLACE FUNCTION vietnamese_to_ascii(input_text TEXT)
RETURNS TEXT AS $$
DECLARE
  result TEXT;
BEGIN
  result := input_text;

  -- Lowercase first
  result := LOWER(result);

  -- Vietnamese 'a' variants
  result := REGEXP_REPLACE(result, '[àáảãạăằắẳẵặâầấẩẫậ]', 'a', 'g');

  -- Vietnamese 'e' variants
  result := REGEXP_REPLACE(result, '[èéẻẽẹêềếểễệ]', 'e', 'g');

  -- Vietnamese 'i' variants
  result := REGEXP_REPLACE(result, '[ìíỉĩị]', 'i', 'g');

  -- Vietnamese 'o' variants
  result := REGEXP_REPLACE(result, '[òóỏõọôồốổỗộơờớởỡợ]', 'o', 'g');

  -- Vietnamese 'u' variants
  result := REGEXP_REPLACE(result, '[ùúủũụưừứửữự]', 'u', 'g');

  -- Vietnamese 'y' variants
  result := REGEXP_REPLACE(result, '[ỳýỷỹỵ]', 'y', 'g');

  -- Vietnamese 'd' variant
  result := REGEXP_REPLACE(result, 'đ', 'd', 'g');

  -- Replace spaces with hyphens
  result := REGEXP_REPLACE(result, '\s+', '-', 'g');

  -- Remove any remaining non-alphanumeric characters (except hyphens)
  result := REGEXP_REPLACE(result, '[^a-z0-9\-]', '', 'g');

  -- Remove consecutive hyphens
  result := REGEXP_REPLACE(result, '-+', '-', 'g');

  -- Trim hyphens from start and end
  result := TRIM(BOTH '-' FROM result);

  RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update all members to have video_filename based on their name
UPDATE members
SET video_filename = 'greeting-' || vietnamese_to_ascii(name) || '.mp4';

-- Show the results (for verification)
-- SELECT name, video_filename FROM members ORDER BY name;

-- Optionally drop the function after use (uncomment if you don't need it anymore)
-- DROP FUNCTION vietnamese_to_ascii(TEXT);
