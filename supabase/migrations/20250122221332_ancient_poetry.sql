/*
  # Content Generation Database Schema

  1. New Tables
    - `user_content`
      - `id` (uuid, primary key)
      - `content_type` (text) - Type of content (blog, article, etc.)
      - `topic` (text) - Main topic/subject
      - `title` (text) - SEO-optimized title
      - `outline` (jsonb) - JSON array of outline items
      - `content` (text) - HTML formatted content
      - `keywords` (jsonb) - JSON array of target keywords
      - `meta_description` (text) - SEO meta description
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `user_id` (uuid) - Reference to auth.users

  2. Security
    - Enable RLS on user_content table
    - Add policies for CRUD operations
*/

CREATE TABLE IF NOT EXISTS user_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL,
  topic text NOT NULL,
  title text NOT NULL,
  outline jsonb NOT NULL DEFAULT '[]'::jsonb,
  content text,
  keywords jsonb NOT NULL DEFAULT '[]'::jsonb,
  meta_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) NOT NULL
);

ALTER TABLE user_content ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can create their own content"
  ON user_content
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own content"
  ON user_content
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own content"
  ON user_content
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content"
  ON user_content
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_content_updated_at
  BEFORE UPDATE
  ON user_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();