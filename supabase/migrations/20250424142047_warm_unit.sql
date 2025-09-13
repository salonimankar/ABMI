/*
  # Fix custom_modes table structure and data

  1. Changes
    - Update existing data to match new structure
    - Add proper constraints for settings column
    - Update settings column to use proper JSONB validation
    - Add trigger for updated_at timestamp

  2. Security
    - Maintain existing RLS policies
*/

-- First, update any existing rows with invalid settings
UPDATE custom_modes
SET settings = '{
  "eyeTracking": true,
  "multilingualSupport": false,
  "timedResponses": true,
  "realTimeFeedback": true,
  "aiAssistant": true,
  "adaptiveDifficulty": true,
  "videoRecording": true,
  "audioRecording": true,
  "transcription": true
}'::jsonb
WHERE settings IS NULL OR NOT (
  settings ? 'eyeTracking' AND
  settings ? 'multilingualSupport' AND
  settings ? 'timedResponses' AND
  settings ? 'realTimeFeedback' AND
  settings ? 'aiAssistant' AND
  settings ? 'adaptiveDifficulty' AND
  settings ? 'videoRecording' AND
  settings ? 'audioRecording' AND
  settings ? 'transcription'
);

-- Update any NULL types to 'general'
UPDATE custom_modes SET type = 'general' WHERE type IS NULL;

-- Update any NULL difficulties to 'intermediate'
UPDATE custom_modes SET difficulty = 'intermediate' WHERE difficulty IS NULL;

-- Now add the constraints
ALTER TABLE custom_modes DROP CONSTRAINT IF EXISTS custom_modes_settings_check;
ALTER TABLE custom_modes ADD CONSTRAINT custom_modes_settings_check CHECK (
  settings ? 'eyeTracking' AND
  settings ? 'multilingualSupport' AND
  settings ? 'timedResponses' AND
  settings ? 'realTimeFeedback' AND
  settings ? 'aiAssistant' AND
  settings ? 'adaptiveDifficulty' AND
  settings ? 'videoRecording' AND
  settings ? 'audioRecording' AND
  settings ? 'transcription'
);

-- Add check constraint for type
ALTER TABLE custom_modes DROP CONSTRAINT IF EXISTS custom_modes_type_check;
ALTER TABLE custom_modes ADD CONSTRAINT custom_modes_type_check
  CHECK (type IN ('technical', 'behavioral', 'general'));

-- Add check constraint for difficulty
ALTER TABLE custom_modes DROP CONSTRAINT IF EXISTS custom_modes_difficulty_check;
ALTER TABLE custom_modes ADD CONSTRAINT custom_modes_difficulty_check
  CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'expert'));

-- Set default value for settings column
ALTER TABLE custom_modes 
ALTER COLUMN settings SET DEFAULT '{
  "eyeTracking": true,
  "multilingualSupport": false,
  "timedResponses": true,
  "realTimeFeedback": true,
  "aiAssistant": true,
  "adaptiveDifficulty": true,
  "videoRecording": true,
  "audioRecording": true,
  "transcription": true
}'::jsonb;

-- Ensure NOT NULL constraints
ALTER TABLE custom_modes ALTER COLUMN settings SET NOT NULL;
ALTER TABLE custom_modes ALTER COLUMN type SET NOT NULL;
ALTER TABLE custom_modes ALTER COLUMN difficulty SET NOT NULL;

-- Ensure updated_at is automatically updated
DROP TRIGGER IF EXISTS update_custom_modes_updated_at ON custom_modes;
CREATE TRIGGER update_custom_modes_updated_at
  BEFORE UPDATE ON custom_modes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();