import { describe, it, expect } from 'vitest';
import { supabase } from '../lib/supabase';

describe('Mock Data Tests', () => {
  const testUserId = 'd0d54aa8-9e37-4aa9-a1b2-b8f0b8d45f4a';
  
  it('should have test user profile', async () => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', testUserId)
      .single();
    
    expect(error).toBeNull();
    expect(profile).toBeDefined();
    expect(profile?.full_name).toBe('John Doe');
    expect(profile?.email).toBe('john.doe@example.com');
  });

  it('should have test interviews', async () => {
    const { data: interviews, error } = await supabase
      .from('interviews')
      .select('*')
      .eq('user_id', testUserId);
    
    expect(error).toBeNull();
    expect(interviews).toHaveLength(4);
    expect(interviews?.map(i => i.type)).toContain('technical');
    expect(interviews?.map(i => i.type)).toContain('behavioral');
  });

  it('should have test feedback', async () => {
    const { data: feedback, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('user_id', testUserId);
    
    expect(error).toBeNull();
    expect(feedback).toHaveLength(4);
    expect(feedback?.[0].feedback_text).toBeDefined();
  });

  it('should have test recordings', async () => {
    const { data: recordings, error } = await supabase
      .from('recordings')
      .select('*')
      .eq('user_id', testUserId);
    
    expect(error).toBeNull();
    expect(recordings).toHaveLength(4);
    expect(recordings?.[0].video_url).toBeDefined();
  });

  it('should have test custom modes', async () => {
    const { data: modes, error } = await supabase
      .from('custom_modes')
      .select('*')
      .eq('user_id', testUserId);
    
    expect(error).toBeNull();
    expect(modes).toHaveLength(3);
    expect(modes?.map(m => m.type)).toContain('technical');
    expect(modes?.map(m => m.type)).toContain('behavioral');
  });

  it('should have test user sessions', async () => {
    const { data: sessions, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', testUserId);
    
    expect(error).toBeNull();
    expect(sessions).toHaveLength(3);
    expect(sessions?.map(s => s.device_type)).toContain('desktop');
    expect(sessions?.map(s => s.device_type)).toContain('mobile');
  });

  it('should have test profile settings', async () => {
    const { data: settings, error } = await supabase
      .from('profile_settings')
      .select('*')
      .eq('user_id', testUserId)
      .single();
    
    expect(error).toBeNull();
    expect(settings).toBeDefined();
    expect(settings?.theme_preference).toBe('dark');
    expect(settings?.language_preference).toBe('en');
  });

  it('should have test notification settings', async () => {
    const { data: notifications, error } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', testUserId)
      .single();
    
    expect(error).toBeNull();
    expect(notifications).toBeDefined();
    expect(notifications?.email_notifications).toBe(true);
    expect(notifications?.notification_frequency).toBe('daily');
  });
});