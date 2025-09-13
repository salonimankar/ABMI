import { supabase } from './supabase';

const API_ENDPOINTS = {
  analyzeInterview: '/functions/v1/analyze-interview',
};

export interface VideoAnalysisData {
  brightness: number;
  contrast: number;
  isVisible: boolean;
}

export interface AudioAnalysisData {
  volume: number;
  clarity: number;
  confidence: number;
}

export interface AnalysisResponse {
  metrics: {
    Confidence: number;
    Clarity: number;
    Engagement: number;
  };
  feedback: {
    posture: 'good' | 'ok' | 'poor';
    emotion: 'good' | 'ok' | 'poor';
    tone: 'good' | 'ok' | 'poor';
  };
  recommendations: string[];
}

export async function analyzeInterview(
  transcript: string,
  videoData: VideoAnalysisData,
  audioData: AudioAnalysisData
): Promise<AnalysisResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('analyze-interview', {
      body: {
        transcript,
        videoData: {
          facialExpressions: {
            smile: videoData.isVisible ? 0.8 : 0,
            attention: videoData.contrast > 50 ? 0.9 : 0.5,
            engagement: videoData.brightness > 50 ? 0.8 : 0.4,
          },
          headPose: {
            pitch: 0,
            yaw: 0,
            roll: 0,
          },
          eyeGaze: {
            direction: [0, 0],
            confidence: videoData.isVisible ? 0.9 : 0,
          },
        },
        audioData: {
          volume: audioData.volume,
          pitch: [],
          wordsPerMinute: 120,
          clarity: audioData.clarity,
        },
      },
    });

    if (error) throw error;

    // Transform the response to match our expected format
    return {
      metrics: {
        Confidence: data.metrics.Confidence,
        Clarity: data.metrics.Clarity,
        Engagement: data.metrics.Engagement,
      },
      feedback: {
        posture: data.metrics.Confidence >= 80 ? 'good' : data.metrics.Confidence >= 60 ? 'ok' : 'poor',
        emotion: data.metrics.Engagement >= 80 ? 'good' : data.metrics.Engagement >= 60 ? 'ok' : 'poor',
        tone: data.metrics.Clarity >= 80 ? 'good' : data.metrics.Clarity >= 60 ? 'ok' : 'poor',
      },
      recommendations: data.recommendations,
    };
  } catch (error) {
    console.error('Error analyzing interview:', error);
    throw new Error('Failed to analyze interview');
  }
} 