/*
  # Update schema for dashboard features

  1. Changes
    - Add difficulty_level and interview_type to interviews table
    - Create feedback table for detailed interview feedback
    - Create recordings table for storing interview recordings
    - Create settings table for user preferences
    - Create custom_modes table for interview customization
    - Add RLS policies and triggers

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to manage their own data
*/

-- Update interviews table with additional fields
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'interviews' AND column_name = 'difficulty_level'
  ) THEN
    ALTER TABLE interviews
    ADD COLUMN difficulty_level text DEFAULT 'intermediate' NOT NULL
    CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'interviews' AND column_name = 'interview_type'
  ) THEN
    ALTER TABLE interviews
    ADD COLUMN interview_type text DEFAULT 'general' NOT NULL
    CHECK (interview_type IN ('general', 'technical', 'behavioral', 'company_specific'));
  END IF;
END $$;

-- Create feedback table for detailed interview feedback
CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id uuid REFERENCES interviews(id),
  user_id uuid REFERENCES users(id),
  confidence_score integer CHECK (confidence_score >= 0 AND confidence_score <= 100),
  clarity_score integer CHECK (clarity_score >= 0 AND clarity_score <= 100),
  eye_contact_score integer CHECK (eye_contact_score >= 0 AND eye_contact_score <= 100),
  engagement_score integer CHECK (engagement_score >= 0 AND engagement_score <= 100),
  speech_rate integer CHECK (speech_rate >= 0 AND speech_rate <= 100),
  response_quality integer CHECK (response_quality >= 0 AND response_quality <= 100),
  answer_structure integer CHECK (answer_structure >= 0 AND answer_structure <= 100),
  feedback_text text[],
  created_at timestamptz DEFAULT now()
);

-- Create recordings table
CREATE TABLE IF NOT EXISTS recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id uuid REFERENCES interviews(id),
  user_id uuid REFERENCES users(id),
  video_url text,
  transcript text,
  duration interval,
  created_at timestamptz DEFAULT now()
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  theme text DEFAULT 'light',
  language text DEFAULT 'en',
  notification_preferences jsonb DEFAULT '{"email": true, "interview_reminders": true, "performance_reports": true}',
  video_settings jsonb DEFAULT '{"resolution": "1080p", "noise_cancellation": true}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create custom_modes table
CREATE TABLE IF NOT EXISTS custom_modes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  name text NOT NULL,
  type text NOT NULL,
  difficulty text NOT NULL,
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
DO $$ 
BEGIN
  ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
  ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;
  ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
  ALTER TABLE custom_modes ENABLE ROW LEVEL SECURITY;
END $$;

-- Drop existing policies if they exist and recreate them
DO $$ 
BEGIN
  -- Feedback policies
  DROP POLICY IF EXISTS "Users can CRUD own feedback" ON feedback;
  CREATE POLICY "Users can CRUD own feedback"
    ON feedback
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id);

  -- Recordings policies
  DROP POLICY IF EXISTS "Users can CRUD own recordings" ON recordings;
  CREATE POLICY "Users can CRUD own recordings"
    ON recordings
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id);

  -- Settings policies
  DROP POLICY IF EXISTS "Users can manage their own settings" ON settings;
  CREATE POLICY "Users can manage their own settings"
    ON settings
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

  -- Custom modes policies
  DROP POLICY IF EXISTS "Users can manage their own custom modes" ON custom_modes;
  CREATE POLICY "Users can manage their own custom modes"
    ON custom_modes
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
END $$;

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
DO $$
BEGIN
  DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
  CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

  DROP TRIGGER IF EXISTS update_custom_modes_updated_at ON custom_modes;
  CREATE TRIGGER update_custom_modes_updated_at
    BEFORE UPDATE ON custom_modes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
END $$;