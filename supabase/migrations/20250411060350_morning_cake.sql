/*
  # Create profile and notification settings tables

  1. New Tables
    - `profile_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `theme_preference` (text)
      - `language_preference` (text)
      - `accessibility_settings` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `notification_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `email_notifications` (boolean)
      - `push_notifications` (boolean)
      - `notification_frequency` (text)
      - `notification_types` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own settings
*/

-- Create profile_settings table
CREATE TABLE IF NOT EXISTS public.profile_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  theme_preference text DEFAULT 'light' NOT NULL,
  language_preference text DEFAULT 'en' NOT NULL,
  accessibility_settings jsonb DEFAULT '{"highContrast": false, "fontSize": "medium", "reduceMotion": false}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create notification_settings table
CREATE TABLE IF NOT EXISTS public.notification_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  email_notifications boolean DEFAULT true,
  push_notifications boolean DEFAULT true,
  notification_frequency text DEFAULT 'daily',
  notification_types jsonb DEFAULT '{
    "interview_reminders": true,
    "performance_reports": true,
    "feedback_received": true,
    "system_updates": true
  }'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profile_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for profile_settings
CREATE POLICY "Users can manage their own profile settings"
  ON profile_settings
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for notification_settings
CREATE POLICY "Users can manage their own notification settings"
  ON notification_settings
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profile_settings_updated_at
  BEFORE UPDATE ON profile_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at
  BEFORE UPDATE ON notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profile_settings_user_id ON profile_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id ON notification_settings(user_id);

-- Insert default settings for existing users
INSERT INTO profile_settings (user_id)
SELECT id FROM profiles
WHERE NOT EXISTS (
  SELECT 1 FROM profile_settings WHERE profile_settings.user_id = profiles.id
);

INSERT INTO notification_settings (user_id)
SELECT id FROM profiles
WHERE NOT EXISTS (
  SELECT 1 FROM notification_settings WHERE notification_settings.user_id = profiles.id
);