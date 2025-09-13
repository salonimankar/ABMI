// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
  github_profile?: string;
  linkedin_profile?: string;
  skills: string[];
}

// Interview Types
export interface Interview {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  duration: number;
  video_url: string;
  transcript: string;
  analysis: InterviewAnalysis;
}

export interface InterviewAnalysis {
  posture: {
    backStraightness: number;
    headTilt: number;
    bodyLean: number;
    stability: number;
  };
  emotion: {
    primaryEmotion: string;
    confidence: number;
    stability: number;
    engagement: number;
  };
  voice: {
    clarity: number;
    speechRate: number;
    tone: number;
    volume: number;
    confidence: number;
  };
  feedback: {
    posture: 'good' | 'ok' | 'poor';
    emotion: 'good' | 'ok' | 'poor';
    tone: 'good' | 'ok' | 'poor';
  };
  recommendations: string[];
  abfScore: number;
}

// Question Types
export interface Question {
  id: string;
  text: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  domain: string;
  skills: string[];
}

// Real-time Analysis Types
export interface RealTimeMetrics {
  posture: {
    backStraightness: number;
    headTilt: number;
    bodyLean: number;
    stability: number;
  };
  emotion: {
    primaryEmotion: string;
    confidence: number;
    stability: number;
    engagement: number;
  };
  voice: {
    clarity: number;
    speechRate: number;
    tone: number;
    volume: number;
    confidence: number;
  };
}

// Dashboard Types
export interface DashboardStats {
  totalInterviews: number;
  practiceHours: number;
  averageABFScore: number;
  weeklyProgress: {
    date: string;
    score: number;
  }[];
  recentInterviews: Interview[];
  recommendations: string[];
}

// Resume Types
export interface Resume {
  id: string;
  user_id: string;
  file_url: string;
  parsed_data: {
    skills: string[];
    experience: {
      company: string;
      position: string;
      duration: string;
      description: string;
    }[];
    education: {
      institution: string;
      degree: string;
      year: string;
    }[];
    projects: {
      name: string;
      description: string;
      technologies: string[];
    }[];
  };
} 