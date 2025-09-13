import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Recording, Interview } from '../lib/types';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';

interface RecordingWithDetails extends Recording {
  interview: Interview;
}

interface RecordingsData {
  recordings: RecordingWithDetails[];
  stats: {
    totalRecordings: number;
    totalDuration: number;
    averageScore: number;
    bestScore: number;
  };
  storageUsage: {
    used: number;
    total: number;
  };
  loading: boolean;
  error: string | null;
  deleteRecordings: (ids: string[]) => Promise<void>;
  downloadRecording: (id: string) => Promise<void>;
}

export function useRecordings(): RecordingsData {
  const [recordings, setRecordings] = useState<RecordingWithDetails[]>([]);
  const [stats, setStats] = useState({
    totalRecordings: 0,
    totalDuration: 0,
    averageScore: 0,
    bestScore: 0,
  });
  const [storageUsage, setStorageUsage] = useState({
    used: 0,
    total: 6, // 6GB total storage limit
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    async function fetchRecordings() {
      try {
        setLoading(true);
        setError(null);

        // Fetch recordings with interview details
        const { data: recordingsData, error: recordingsError } = await supabase
          .from('recordings')
          .select(`
            *,
            interview:interviews(*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (recordingsError) throw recordingsError;

        // Calculate stats
        const totalRecordings = recordingsData.length;
        const scores = recordingsData.map(r => r.interview?.score).filter(Boolean);
        const averageScore = scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 0;
        const bestScore = scores.length > 0 ? Math.max(...scores) : 0;

        // Calculate total duration in hours
        const totalDuration = recordingsData.reduce((total, rec) => {
          const duration = rec.duration ? parseFloat(rec.duration) : 0;
          return total + duration;
        }, 0) / 3600; // Convert to hours

        // Calculate storage usage (assuming 100MB per minute of video)
        const usedStorage = recordingsData.reduce((total, rec) => {
          const durationInMinutes = rec.duration ? parseFloat(rec.duration) / 60 : 0;
          return total + (durationInMinutes * 100);
        }, 0) / 1024; // Convert to GB

        setRecordings(recordingsData as RecordingWithDetails[]);
        setStats({
          totalRecordings,
          totalDuration: Math.round(totalDuration * 10) / 10, // Round to 1 decimal
          averageScore,
          bestScore,
        });
        setStorageUsage({
          used: Math.round(usedStorage * 10) / 10, // Round to 1 decimal
          total: 6,
        });
      } catch (err) {
        console.error('Error fetching recordings:', err);
        setError('Failed to load recordings');
        toast.error('Failed to load recordings');
      } finally {
        setLoading(false);
      }
    }

    fetchRecordings();
  }, [user]);

  const deleteRecordings = async (ids: string[]) => {
    if (!user) {
      toast.error('You must be logged in to delete recordings');
      return;
    }

    try {
      // Delete recordings from storage
      for (const id of ids) {
        const recording = recordings.find(r => r.id === id);
        if (recording?.video_url) {
          const path = recording.video_url.split('/').pop();
          if (path) {
            const { error: storageError } = await supabase.storage
              .from('recordings')
              .remove([path]);
            if (storageError) throw storageError;
          }
        }
      }

      // Delete recordings from database
      const { error: deleteError } = await supabase
        .from('recordings')
        .delete()
        .in('id', ids)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      // Update local state
      setRecordings(prev => prev.filter(r => !ids.includes(r.id)));

      // Update stats
      const remainingRecordings = recordings.filter(r => !ids.includes(r.id));
      const scores = remainingRecordings.map(r => r.interview?.score).filter(Boolean);
      const averageScore = scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;
      const bestScore = scores.length > 0 ? Math.max(...scores) : 0;

      setStats(prev => ({
        ...prev,
        totalRecordings: remainingRecordings.length,
        averageScore,
        bestScore,
      }));
    } catch (err) {
      console.error('Error deleting recordings:', err);
      throw err;
    }
  };

  const downloadRecording = async (id: string) => {
    if (!user) {
      toast.error('You must be logged in to download recordings');
      return;
    }

    try {
      const recording = recordings.find(r => r.id === id);
      if (!recording?.video_url) {
        throw new Error('Video URL not found');
      }

      const path = recording.video_url.split('/').pop();
      if (!path) {
        throw new Error('Invalid video URL');
      }

      const { data, error: downloadError } = await supabase.storage
        .from('recordings')
        .download(path);

      if (downloadError) throw downloadError;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recording-${id}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading recording:', err);
      throw err;
    }
  };

  return {
    recordings,
    stats,
    storageUsage,
    loading,
    error,
    deleteRecordings,
    downloadRecording,
  };
}