/*
  # Create user sessions table

  1. New Tables
    - `user_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `device_name` (text)
      - `device_type` (text)
      - `user_agent` (text)
      - `last_active` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `user_sessions` table
    - Add policies for authenticated users to:
      - Read their own sessions
      - Create new sessions
      - Delete their own sessions

  3. Foreign Keys
    - `user_id` references `auth.users(id)` with CASCADE on delete
*/

-- Create the user_sessions table
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_name text NOT NULL,
  device_type text NOT NULL,
  user_agent text NOT NULL,
  last_active timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS user_sessions_user_id_idx ON public.user_sessions(user_id);

-- Enable RLS
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own sessions"
  ON public.user_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create sessions"
  ON public.user_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON public.user_sessions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);