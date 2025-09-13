/*
  # Create interviews and related tables

  1. New Tables
    - `interviews`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `title` (text)
      - `type` (text)
      - `duration` (interval)
      - `score` (integer)
      - `video_url` (text)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)

    - `interview_feedback`
      - `id` (uuid, primary key)
      - `interview_id` (uuid, references interviews)
      - `category` (text)
      - `score` (integer)
      - `feedback` (text)
      - `created_at` (timestamp with time zone)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to:
      - Read their own interviews and feedback
      - Create new interviews and feedback
      - Update their own interviews
*/

-- Interviews table
CREATE TABLE IF NOT EXISTS interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  type text NOT NULL,
  duration interval,
  score integer CHECK (score >= 0 AND score <= 100),
  video_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Interview feedback table
CREATE TABLE IF NOT EXISTS interview_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id uuid REFERENCES interviews(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL,
  score integer CHECK (score >= 0 AND score <= 100),
  feedback text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_feedback ENABLE ROW LEVEL SECURITY;

-- Policies for interviews
CREATE POLICY "Users can read own interviews"
  ON interviews
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create interviews"
  ON interviews
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interviews"
  ON interviews
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for interview_feedback
CREATE POLICY "Users can read own interview feedback"
  ON interview_feedback
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM interviews
      WHERE interviews.id = interview_feedback.interview_id
      AND interviews.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create interview feedback"
  ON interview_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM interviews
      WHERE interviews.id = interview_feedback.interview_id
      AND interviews.user_id = auth.uid()
    )
  );