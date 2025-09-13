import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Interview, Feedback, Recording } from '../lib/types';
import { useAuth } from '../hooks/useAuth';

interface DashboardStats {
  totalInterviews: number;
  practiceHours: number;
  averageScore: number;
  bestScore: number;
}

interface DashboardData {
  stats: DashboardStats;
  weeklyProgress: { date: string; score: number }[];
  latestFeedback: Feedback[];
  loading: boolean;
  error: string | null;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export function useDashboard(): DashboardData {
  const [stats, setStats] = useState<DashboardStats>({
    totalInterviews: 0,
    practiceHours: 0,
    averageScore: 0,
    bestScore: 0,
  });
  const [weeklyProgress, setWeeklyProgress] = useState<{ date: string; score: number }[]>([]);
  const [latestFeedback, setLatestFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    let retryCount = 0;
    let mounted = true;

    async function fetchWithRetry<T>(
      operation: () => Promise<T>,
      errorMessage: string
    ): Promise<T | null> {
      while (retryCount < MAX_RETRIES) {
        try {
          const result = await operation();
          return result;
        } catch (err) {
          retryCount++;
          console.error(`${errorMessage} (Attempt ${retryCount}/${MAX_RETRIES}):`, err);
          
          if (retryCount === MAX_RETRIES) {
            throw new Error(`${errorMessage}: ${err.message}`);
          }
          
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * retryCount));
        }
      }
      return null;
    }

    async function fetchDashboardData() {
      if (!mounted) return;
      
      try {
        setLoading(true);
        setError(null);

        // Fetch interviews with retry
        const { data: interviews, error: interviewsError } = await fetchWithRetry(
          () => supabase
            .from('interviews')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }),
          'Failed to fetch interviews'
        ) || { data: null, error: interviewsError };

        if (interviewsError) throw interviewsError;

        // Calculate stats
        const totalInterviews = interviews?.length || 0;
        const scores = interviews?.map(i => i.score).filter(Boolean) || [];
        const averageScore = scores.length > 0 
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
          : 0;
        const bestScore = scores.length > 0 ? Math.max(...scores) : 0;

        // Fetch recordings with retry
        const { data: recordings } = await fetchWithRetry(
          () => supabase
            .from('recordings')
            .select('duration')
            .eq('user_id', user.id),
          'Failed to fetch recordings'
        ) || { data: null };

        const practiceHours = recordings?.reduce((total, rec) => {
          const duration = rec.duration ? parseFloat(rec.duration) : 0;
          return total + duration;
        }, 0) || 0;

        // Fetch weekly progress
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const { data: weeklyInterviews } = await fetchWithRetry(
          () => supabase
            .from('interviews')
            .select('created_at, score')
            .eq('user_id', user.id)
            .gte('created_at', oneWeekAgo.toISOString())
            .order('created_at', { ascending: true }),
          'Failed to fetch weekly progress'
        ) || { data: null };

        const progress = weeklyInterviews?.map(interview => ({
          date: new Date(interview.created_at).toLocaleDateString('en-US', { weekday: 'short' }),
          score: interview.score || 0,
        })) || [];

        // Fetch latest feedback with retry
        const { data: feedback } = await fetchWithRetry(
          () => supabase
            .from('feedback')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(3),
          'Failed to fetch feedback'
        ) || { data: null };

        if (mounted) {
          setStats({
            totalInterviews,
            practiceHours: Math.round(practiceHours / 3600), // Convert seconds to hours
            averageScore,
            bestScore,
          });
          setWeeklyProgress(progress);
          setLatestFeedback(feedback || []);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        if (mounted) {
          setError(err.message || 'Failed to load dashboard data. Please check your connection and try again.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchDashboardData();

    return () => {
      mounted = false;
    };
  }, [user]);

  return {
    stats,
    weeklyProgress,
    latestFeedback,
    loading,
    error,
  };
}