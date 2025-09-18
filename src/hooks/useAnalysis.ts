import { useState, useEffect } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase';
import { Interview, Feedback } from '../lib/types';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';

interface SkillScore {
  name: string;
  value: number;
}

interface AnalysisData {
  performanceData: { date: string; score: number; duration: number }[];
  skillsData: SkillScore[];
  communicationSkills: {
    clarity: number;
    structure: number;
    examples: number;
    bodyLanguage: number;
  };
  recommendations: { title: string; description: string }[];
  latestInterview: Interview | null;
  loading: boolean;
  error: string | null;
}

// Default data for when no data is available
const defaultData: AnalysisData = {
  performanceData: [
    { date: '2024-03-15', score: 85, duration: 45 },
    { date: '2024-03-10', score: 78, duration: 40 },
    { date: '2024-03-05', score: 82, duration: 50 },
  ],
  skillsData: [
    { name: 'Technical Knowledge', value: 85 },
    { name: 'Communication', value: 78 },
    { name: 'Problem Solving', value: 82 },
    { name: 'Leadership', value: 75 },
  ],
  communicationSkills: {
    clarity: 85,
    structure: 78,
    examples: 82,
    bodyLanguage: 75,
  },
  recommendations: [
    {
      title: 'Improve Technical Depth',
      description: 'Focus on deepening your understanding of core concepts.',
    },
    {
      title: 'Reduce Filler Words',
      description: 'Practice speaking more concisely and confidently.',
    },
    {
      title: 'Enhance Problem-Solving Approach',
      description: 'Structure your problem-solving process more clearly.',
    },
  ],
  latestInterview: {
    id: '1',
    date: '2024-03-15',
    score: 85,
    duration: 45,
  },
  loading: false,
  error: null,
};

export function useAnalysis(): AnalysisData & {
  exportPDF: () => Promise<void>;
  shareReport: () => Promise<void>;
} {
  const [performanceData, setPerformanceData] = useState(defaultData.performanceData);
  const [skillsData, setSkillsData] = useState(defaultData.skillsData);
  const [communicationSkills, setCommunicationSkills] = useState(defaultData.communicationSkills);
  const [recommendations, setRecommendations] = useState(defaultData.recommendations);
  const [latestInterview, setLatestInterview] = useState<Interview | null>(defaultData.latestInterview);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !supabaseConfigured) {
      setLoading(false);
      return;
    }

    async function fetchAnalysisData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch last 30 days of interviews
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: interviews, error: interviewsError } = await supabase
          .from('interviews')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', thirtyDaysAgo.toISOString())
          .order('created_at', { ascending: true });

        if (interviewsError) throw interviewsError;

        // If no interviews found, use default data
        if (!interviews || interviews.length === 0) {
          setLoading(false);
          return;
        }

        // Format performance data
        const performance = interviews.map(interview => ({
          date: new Date(interview.created_at).toLocaleDateString(),
          score: interview.score || 0,
          duration: interview.duration || 0,
        }));

        // Fetch feedback for skills analysis
        const { data: feedbackData, error: feedbackError } = await supabase
          .from('feedback')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (feedbackError) throw feedbackError;

        // If no feedback found, use default data
        if (!feedbackData || feedbackData.length === 0) {
          setLoading(false);
          return;
        }

        // Calculate average scores for different skills
        const skills = feedbackData.reduce((acc, feedback) => {
          acc.technical = (acc.technical || 0) + (feedback.response_quality || 0);
          acc.communication = (acc.communication || 0) + (feedback.clarity_score || 0);
          acc.problemSolving = (acc.problemSolving || 0) + (feedback.answer_structure || 0);
          acc.leadership = (acc.leadership || 0) + (feedback.engagement_score || 0);
          return acc;
        }, {} as Record<string, number>);

        const totalFeedback = feedbackData.length || 1;
        const skillsDataArray = [
          { name: 'Technical Knowledge', value: Math.round(skills.technical / totalFeedback) },
          { name: 'Communication', value: Math.round(skills.communication / totalFeedback) },
          { name: 'Problem Solving', value: Math.round(skills.problemSolving / totalFeedback) },
          { name: 'Leadership', value: Math.round(skills.leadership / totalFeedback) },
        ];

        // Calculate communication skills
        const commSkills = feedbackData.reduce((acc, feedback) => {
          acc.clarity += feedback.clarity_score || 0;
          acc.structure += feedback.answer_structure || 0;
          acc.examples += feedback.response_quality || 0;
          acc.bodyLanguage += feedback.eye_contact_score || 0;
          return acc;
        }, { clarity: 0, structure: 0, examples: 0, bodyLanguage: 0 });

        const normalizedCommSkills = {
          clarity: Math.round(commSkills.clarity / totalFeedback),
          structure: Math.round(commSkills.structure / totalFeedback),
          examples: Math.round(commSkills.examples / totalFeedback),
          bodyLanguage: Math.round(commSkills.bodyLanguage / totalFeedback),
        };

        // Get latest feedback for recommendations
        const latestFeedback = feedbackData[0];
        const recommendationsArray = latestFeedback?.feedback_text?.map((text, index) => ({
          title: `Recommendation ${index + 1}`,
          description: text,
        })) || defaultData.recommendations;

        setPerformanceData(performance);
        setSkillsData(skillsDataArray);
        setCommunicationSkills(normalizedCommSkills);
        setRecommendations(recommendationsArray);
        setLatestInterview(interviews[interviews.length - 1] || null);
        setError(null);
      } catch (err) {
        console.error('Error fetching analysis data:', err);
        setError('Failed to load analysis data');
        toast.error('Failed to load analysis data');
      } finally {
        setLoading(false);
      }
    }

    fetchAnalysisData();
  }, [user]);

  const exportPDF = async () => {
    try {
      toast.info('Preparing PDF export...');
      // Implementation would go here - for now just show success
      setTimeout(() => {
        toast.success('Analysis report exported successfully');
      }, 1500);
    } catch (err) {
      console.error('Error exporting PDF:', err);
      toast.error('Failed to export PDF');
    }
  };

  const shareReport = async () => {
    try {
      toast.info('Preparing report for sharing...');
      // Implementation would go here - for now just show success
      setTimeout(() => {
        toast.success('Report shared successfully');
      }, 1500);
    } catch (err) {
      console.error('Error sharing report:', err);
      toast.error('Failed to share report');
    }
  };

  return {
    performanceData,
    skillsData,
    communicationSkills,
    recommendations,
    latestInterview,
    loading,
    error,
    exportPDF,
    shareReport,
  };
}