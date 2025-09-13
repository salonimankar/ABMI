export interface Interview {
  id: string;
  user_id: string;
  title: string;
  type: string;
  duration: string;
  score: number;
  video_url: string | null;
  created_at: string;
  updated_at: string;
  difficulty_level: string;
  interview_type: string;
}

export interface Feedback {
  id: string;
  interview_id: string;
  user_id: string;
  confidence_score: number;
  clarity_score: number;
  eye_contact_score: number;
  engagement_score: number;
  speech_rate: number;
  response_quality: number;
  answer_structure: number;
  feedback_text: string[];
  created_at: string;
}

export interface Recording {
  id: string;
  interview_id: string;
  user_id: string;
  video_url: string | null;
  transcript: string | null;
  duration: string;
  created_at: string;
}

export interface Settings {
  id: string;
  user_id: string;
  theme: string;
  language: string;
  notification_preferences: {
    email: boolean;
    interview_reminders: boolean;
    performance_reports: boolean;
  };
  video_settings: {
    resolution: string;
    noise_cancellation: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface CustomMode {
  id: string;
  user_id: string;
  name: string;
  type: string;
  difficulty: string;
  settings: {
    eyeTracking: boolean;
    multilingualSupport: boolean;
    timedResponses: boolean;
    realTimeFeedback: boolean;
    aiAssistant: boolean;
    adaptiveDifficulty: boolean;
    videoRecording: boolean;
    audioRecording: boolean;
    transcription: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}