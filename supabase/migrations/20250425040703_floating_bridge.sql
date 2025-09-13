/*
  # Fix RLS policies for profiles table

  1. Changes
    - Update RLS policies to allow proper profile creation and updates
    - Add policy for initial profile creation on signup
    - Fix user authentication checks

  2. Security
    - Maintain secure access control while allowing necessary operations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create new policies with proper checks
CREATE POLICY "Enable read access for own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Update the handle_new_user function to handle initial profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', NULL)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;