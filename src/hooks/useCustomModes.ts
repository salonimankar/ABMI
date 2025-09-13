import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CustomMode } from '../lib/types';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';

interface CustomModesData {
  modes: CustomMode[];
  loading: boolean;
  error: string | null;
  createMode: (mode: Partial<CustomMode>) => Promise<void>;
  updateMode: (id: string, mode: Partial<CustomMode>) => Promise<void>;
  deleteMode: (id: string) => Promise<void>;
}

export function useCustomModes(): CustomModesData {
  const [modes, setModes] = useState<CustomMode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    async function fetchCustomModes() {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('custom_modes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        setModes(data || []);
      } catch (err) {
        console.error('Error fetching custom modes:', err);
        setError('Failed to load custom modes');
        toast.error('Failed to load custom modes');
      } finally {
        setLoading(false);
      }
    }

    fetchCustomModes();
  }, [user]);

  const createMode = async (mode: Partial<CustomMode>) => {
    if (!user) {
      toast.error('You must be logged in to create a mode');
      return;
    }

    try {
      const defaultSettings = {
        eyeTracking: true,
        multilingualSupport: false,
        timedResponses: true,
        realTimeFeedback: true,
        aiAssistant: true,
        adaptiveDifficulty: true,
        videoRecording: true,
        audioRecording: true,
        transcription: true,
      };

      const newMode = {
        name: mode.name,
        type: mode.type,
        difficulty: mode.difficulty,
        user_id: user.id,
        settings: mode.settings || defaultSettings,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error: createError } = await supabase
        .from('custom_modes')
        .insert([newMode])
        .select()
        .single();

      if (createError) throw createError;

      setModes(prevModes => [data, ...prevModes]);
      toast.success('Custom mode created successfully');
    } catch (err) {
      console.error('Error creating custom mode:', err);
      toast.error('Failed to create custom mode');
      throw err;
    }
  };

  const updateMode = async (id: string, mode: Partial<CustomMode>) => {
    if (!user) {
      toast.error('You must be logged in to update a mode');
      return;
    }

    try {
      const updateData = {
        ...mode,
        updated_at: new Date().toISOString(),
      };

      const { data, error: updateError } = await supabase
        .from('custom_modes')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setModes(prevModes =>
        prevModes.map(m => (m.id === id ? { ...m, ...data } : m))
      );
      toast.success('Custom mode updated successfully');
    } catch (err) {
      console.error('Error updating custom mode:', err);
      toast.error('Failed to update custom mode');
      throw err;
    }
  };

  const deleteMode = async (id: string) => {
    if (!user) {
      toast.error('You must be logged in to delete a mode');
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from('custom_modes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      setModes(prevModes => prevModes.filter(m => m.id !== id));
      toast.success('Custom mode deleted successfully');
    } catch (err) {
      console.error('Error deleting custom mode:', err);
      toast.error('Failed to delete custom mode');
      throw err;
    }
  };

  return {
    modes,
    loading,
    error,
    createMode,
    updateMode,
    deleteMode,
  };
}