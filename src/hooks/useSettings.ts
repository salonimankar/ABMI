import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface Settings {
  id: string;
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  dark_mode: boolean;
  language: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

// Default settings
const defaultSettings: Settings = {
  id: '',
  user_id: '',
  email_notifications: true,
  push_notifications: true,
  dark_mode: false,
  language: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export function useSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchSettings() {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            // No settings found, create default settings
            const { data: newSettings, error: createError } = await supabase
              .from('settings')
              .insert([
                {
                  user_id: user.id,
                  email_notifications: true,
                  push_notifications: true,
                  dark_mode: false,
                  language: 'en',
                  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                },
              ])
              .select()
              .single();

            if (createError) throw createError;
            setSettings(newSettings);
          } else {
            throw fetchError;
          }
        } else {
          setSettings(data);
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError('Failed to load settings');
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, [user]);

  const updateSettings = async (updates: Partial<Settings>) => {
    if (!user) return;

    try {
      setSaving(true);
      setError(null);

      const { data, error: updateError } = await supabase
        .from('settings')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setSettings(data);
      toast.success('Settings updated successfully');
    } catch (err) {
      console.error('Error updating settings:', err);
      setError('Failed to update settings');
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return {
    settings,
    loading,
    saving,
    error,
    updateSettings,
  };
} 