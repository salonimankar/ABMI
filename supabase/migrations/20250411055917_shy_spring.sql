/*
  # Add user sessions table for device management

  1. New Tables
    - `user_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `user_agent` (text)
      - `ip_address` (text)
      - `created_at` (timestamp with time zone)
      - `last_active` (timestamp with time zone)

  2. Security
    - Enable RLS on user_sessions table
    - Add policies for authenticated users to read their own sessions
*/

CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  user_agent text NOT NULL,
  ip_address text NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_active timestamptz DEFAULT now()
);

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own sessions"
  ON user_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update last_active timestamp
CREATE OR REPLACE FUNCTION update_session_last_active()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_active = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last_active on session access
CREATE TRIGGER update_session_last_active
  BEFORE UPDATE ON user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_session_last_active();