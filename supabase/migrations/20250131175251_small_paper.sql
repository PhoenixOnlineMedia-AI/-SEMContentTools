/*
  # Add platform field for social media posts

  1. Changes
    - Add `platform` column to `user_content` table for social media platform selection
    - Make column nullable since it's only used for social media posts
    - Add index for better query performance when filtering by platform

  2. Notes
    - No data migration needed as new field is nullable
    - Existing content will have NULL platform values
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_content' AND column_name = 'platform'
  ) THEN
    ALTER TABLE user_content ADD COLUMN platform text;
    CREATE INDEX idx_user_content_platform ON user_content(platform);
  END IF;
END $$;