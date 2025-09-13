/*
  # Add mock data for testing

  1. Purpose
    - Add realistic test data for all tables
    - Enable thorough testing of all features
    - Provide sample content for UI development

  2. Tables Seeded
    - auth.users
    - profiles
    - interviews
    - feedback
    - recordings
    - custom_modes
    - user_sessions
    - profile_settings
    - notification_settings
*/

-- Insert test users into auth.users
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES
  ('d0d54aa8-9e37-4aa9-a1b2-b8f0b8d45f4a', 'john.doe@example.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}'),
  ('e1e65bb9-0f38-5bb0-b2c3-c9f1c9e56f5b', 'jane.smith@example.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}'),
  ('f2f76cc0-1f39-6cc1-c3d4-d0f2d0f67f6c', 'bob.wilson@example.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}');

-- Insert test profiles
INSERT INTO profiles (id, email, full_name, created_at)
VALUES
  ('d0d54aa8-9e37-4aa9-a1b2-b8f0b8d45f4a', 'john.doe@example.com', 'John Doe', now() - interval '30 days'),
  ('e1e65bb9-0f38-5bb0-b2c3-c9f1c9e56f5b', 'jane.smith@example.com', 'Jane Smith', now() - interval '25 days'),
  ('f2f76cc0-1f39-6cc1-c3d4-d0f2d0f67f6c', 'bob.wilson@example.com', 'Bob Wilson', now() - interval '20 days');

-- Insert test interviews
INSERT INTO interviews (id, user_id, title, type, duration, score, video_url, difficulty_level, interview_type, created_at)
VALUES
  ('a1a43991-8d26-3991-91a2-a8e0a8d34e3a', 'd0d54aa8-9e37-4aa9-a1b2-b8f0b8d45f4a', 'Technical Interview Practice', 'technical', interval '45 minutes', 85, 'https://example.com/video1.mp4', 'intermediate', 'technical', now() - interval '20 days'),
  ('b2b54002-9e27-4002-02b3-b9f1b9e45f4b', 'd0d54aa8-9e37-4aa9-a1b2-b8f0b8d45f4a', 'Behavioral Interview Session', 'behavioral', interval '30 minutes', 92, 'https://example.com/video2.mp4', 'advanced', 'behavioral', now() - interval '15 days'),
  ('c3c65113-0f28-5113-13c4-c0f2c0f56f5c', 'd0d54aa8-9e37-4aa9-a1b2-b8f0b8d45f4a', 'General Interview Practice', 'general', interval '35 minutes', 78, 'https://example.com/video3.mp4', 'beginner', 'general', now() - interval '10 days'),
  ('d4d76224-1f29-6224-24d5-d1f3d1f67f6d', 'd0d54aa8-9e37-4aa9-a1b2-b8f0b8d45f4a', 'Technical Deep Dive', 'technical', interval '60 minutes', 88, 'https://example.com/video4.mp4', 'expert', 'technical', now() - interval '5 days');

-- Insert test feedback
INSERT INTO feedback (interview_id, user_id, confidence_score, clarity_score, eye_contact_score, engagement_score, speech_rate, response_quality, answer_structure, feedback_text, created_at)
VALUES
  ('a1a43991-8d26-3991-91a2-a8e0a8d34e3a', 'd0d54aa8-9e37-4aa9-a1b2-b8f0b8d45f4a', 85, 90, 75, 88, 82, 85, 80, ARRAY['Great technical depth shown', 'Could improve eye contact', 'Well-structured responses'], now() - interval '19 days'),
  ('b2b54002-9e27-4002-02b3-b9f1b9e45f4b', 'd0d54aa8-9e37-4aa9-a1b2-b8f0b8d45f4a', 92, 88, 85, 90, 85, 90, 92, ARRAY['Excellent behavioral examples', 'Strong communication skills', 'Very engaging presence'], now() - interval '14 days'),
  ('c3c65113-0f28-5113-13c4-c0f2c0f56f5c', 'd0d54aa8-9e37-4aa9-a1b2-b8f0b8d45f4a', 78, 75, 80, 82, 85, 76, 75, ARRAY['Good basic understanding', 'Need more specific examples', 'Room for improvement in structure'], now() - interval '9 days'),
  ('d4d76224-1f29-6224-24d5-d1f3d1f67f6d', 'd0d54aa8-9e37-4aa9-a1b2-b8f0b8d45f4a', 88, 92, 85, 90, 88, 95, 90, ARRAY['Outstanding technical knowledge', 'Clear and concise communication', 'Excellent problem-solving approach'], now() - interval '4 days');

-- Insert test recordings
INSERT INTO recordings (interview_id, user_id, video_url, transcript, duration, created_at)
VALUES
  ('a1a43991-8d26-3991-91a2-a8e0a8d34e3a', 'd0d54aa8-9e37-4aa9-a1b2-b8f0b8d45f4a', 'https://example.com/recording1.mp4', 'Sample transcript for technical interview...', interval '45 minutes', now() - interval '20 days'),
  ('b2b54002-9e27-4002-02b3-b9f1b9e45f4b', 'd0d54aa8-9e37-4aa9-a1b2-b8f0b8d45f4a', 'https://example.com/recording2.mp4', 'Sample transcript for behavioral interview...', interval '30 minutes', now() - interval '15 days'),
  ('c3c65113-0f28-5113-13c4-c0f2c0f56f5c', 'd0d54aa8-9e37-4aa9-a1b2-b8f0b8d45f4a', 'https://example.com/recording3.mp4', 'Sample transcript for general interview...', interval '35 minutes', now() - interval '10 days'),
  ('d4d76224-1f29-6224-24d5-d1f3d1f67f6d', 'd0d54aa8-9e37-4aa9-a1b2-b8f0b8d45f4a', 'https://example.com/recording4.mp4', 'Sample transcript for technical deep dive...', interval '60 minutes', now() - interval '5 days');

-- Insert test custom modes
INSERT INTO custom_modes (user_id, name, type, difficulty, settings, created_at)
VALUES
  ('d0d54aa8-9e37-4aa9-a1b2-b8f0b8d45f4a', 'Technical Deep Dive', 'technical', 'expert', '{"eyeTracking": true, "multilingualSupport": false, "timedResponses": true, "realTimeFeedback": true, "aiAssistant": true}', now() - interval '25 days'),
  ('d0d54aa8-9e37-4aa9-a1b2-b8f0b8d45f4a', 'Behavioral Focus', 'behavioral', 'intermediate', '{"eyeTracking": true, "multilingualSupport": true, "timedResponses": false, "realTimeFeedback": true, "aiAssistant": true}', now() - interval '20 days'),
  ('d0d54aa8-9e37-4aa9-a1b2-b8f0b8d45f4a', 'Quick Practice', 'general', 'beginner', '{"eyeTracking": false, "multilingualSupport": false, "timedResponses": true, "realTimeFeedback": true, "aiAssistant": false}', now() - interval '15 days');

-- Insert test user sessions
INSERT INTO user_sessions (user_id, device_name, device_type, user_agent, last_active, created_at)
VALUES
  ('d0d54aa8-9e37-4aa9-a1b2-b8f0b8d45f4a', 'Chrome on MacBook', 'desktop', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', now() - interval '1 hour', now() - interval '30 days'),
  ('d0d54aa8-9e37-4aa9-a1b2-b8f0b8d45f4a', 'Safari on iPhone', 'mobile', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0)', now() - interval '2 hours', now() - interval '25 days'),
  ('d0d54aa8-9e37-4aa9-a1b2-b8f0b8d45f4a', 'Firefox on Windows', 'desktop', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', now() - interval '3 hours', now() - interval '20 days');

-- Insert test profile settings
INSERT INTO profile_settings (user_id, theme_preference, language_preference, accessibility_settings, created_at)
VALUES
  ('d0d54aa8-9e37-4aa9-a1b2-b8f0b8d45f4a', 'dark', 'en', '{"fontSize": "medium", "highContrast": false, "reduceMotion": true}', now() - interval '30 days'),
  ('e1e65bb9-0f38-5bb0-b2c3-c9f1c9e56f5b', 'light', 'es', '{"fontSize": "large", "highContrast": true, "reduceMotion": false}', now() - interval '25 days'),
  ('f2f76cc0-1f39-6cc1-c3d4-d0f2d0f67f6c', 'light', 'fr', '{"fontSize": "small", "highContrast": false, "reduceMotion": false}', now() - interval '20 days');

-- Insert test notification settings
INSERT INTO notification_settings (user_id, email_notifications, push_notifications, notification_frequency, notification_types, created_at)
VALUES
  ('d0d54aa8-9e37-4aa9-a1b2-b8f0b8d45f4a', true, true, 'daily', '{"system_updates": true, "feedback_received": true, "interview_reminders": true, "performance_reports": true}', now() - interval '30 days'),
  ('e1e65bb9-0f38-5bb0-b2c3-c9f1c9e56f5b', true, false, 'weekly', '{"system_updates": false, "feedback_received": true, "interview_reminders": true, "performance_reports": false}', now() - interval '25 days'),
  ('f2f76cc0-1f39-6cc1-c3d4-d0f2d0f67f6c', false, true, 'monthly', '{"system_updates": true, "feedback_received": false, "interview_reminders": true, "performance_reports": true}', now() - interval '20 days');