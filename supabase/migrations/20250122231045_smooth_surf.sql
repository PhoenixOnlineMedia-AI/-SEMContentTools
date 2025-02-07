/*
  # Add INSERT policy for profiles table

  1. Changes
    - Add policy for inserting new profiles during signup
    - Only add the missing INSERT policy since other policies already exist

  2. Security
    - Allow users to create their own profile during signup
*/

-- Allow users to insert their own profile
CREATE POLICY "Users can create their own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);