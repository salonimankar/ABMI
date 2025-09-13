/*
  # Fix settings table foreign key constraint

  1. Changes
    - Drop existing foreign key constraint that references users table
    - Add new foreign key constraint to reference profiles table
    - Add cascade delete to automatically remove settings when profile is deleted

  2. Security
    - Maintains existing RLS policies
*/

-- Drop the existing foreign key constraint
ALTER TABLE settings
DROP CONSTRAINT IF EXISTS settings_user_id_fkey;

-- Add new foreign key constraint referencing profiles table
ALTER TABLE settings
ADD CONSTRAINT settings_user_id_fkey
FOREIGN KEY (user_id) REFERENCES profiles(id)
ON DELETE CASCADE;