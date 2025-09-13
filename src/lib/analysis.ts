import { supabase } from './supabase';

// MediaPipe Pose Types
interface PoseData {
  backStraightnessScore: number;
  headTiltAngle: number;
  bodyLeanScore: number;
  stabilityIndex: number;
}

// Facial Expression Types
interface FacialData {
  primaryEmotion: string;
  emotionConfidence: number;
  emotionalStability: number;
  engagementLevel: number;
}

// Voice Analysis Types
interface VoiceData {
  clarityScore: number;
  speechRate: number;
  tonePolarity: number;
  volumeConsistency: number;
  confidenceScore: number;
}

interface InterviewData {
  transcript: string;
  poseData: PoseData;
  facialData: FacialData;
  voiceData: VoiceData;
}

interface AnalysisResponse {
  metrics: {
    Posture: {
      backStraightness: number;
      headTilt: number;
      bodyLean: number;
      stability: number;
    };
    Emotion: {
      primaryEmotion: string;
      confidence: number;
      stability: number;
      engagement: number;
    };
    Voice: {
      clarity: number;
      speechRate: number;
      tone: number;
      volume: number;
      confidence: number;
    };
  };
  feedback: {
    posture: 'good' | 'ok' | 'poor';
    emotion: 'good' | 'ok' | 'poor';
    tone: 'good' | 'ok' | 'poor';
  };
  recommendations: string[];
}

function normalizeScore(score: number): number {
  return Math.min(100, Math.max(0, score));
}

function calculatePostureFeedback(metrics: AnalysisResponse['metrics']['Posture']): 'good' | 'ok' | 'poor' {
  const avgScore = (metrics.backStraightness + metrics.headTilt + metrics.bodyLean + metrics.stability) / 4;
  return avgScore >= 80 ? 'good' : avgScore >= 60 ? 'ok' : 'poor';
}

function calculateEmotionFeedback(metrics: AnalysisResponse['metrics']['Emotion']): 'good' | 'ok' | 'poor' {
  const avgScore = (metrics.confidence + metrics.stability + metrics.engagement) / 3;
  return avgScore >= 80 ? 'good' : avgScore >= 60 ? 'ok' : 'poor';
}

function calculateVoiceFeedback(metrics: AnalysisResponse['metrics']['Voice']): 'good' | 'ok' | 'poor' {
  const avgScore = (metrics.clarity + metrics.tone + metrics.volume + metrics.confidence) / 4;
  return avgScore >= 80 ? 'good' : avgScore >= 60 ? 'ok' : 'poor';
}

function generateRecommendations(metrics: AnalysisResponse['metrics'], feedback: AnalysisResponse['feedback']): string[] {
  const recommendations: string[] = [];

  if (feedback.posture === 'poor') {
    recommendations.push('Work on maintaining better posture and body language.');
  }
  if (feedback.emotion === 'poor') {
    recommendations.push('Show more engagement and enthusiasm through facial expressions.');
  }
  if (feedback.tone === 'poor') {
    recommendations.push('Focus on speaking more clearly and with better tone.');
  }

  return recommendations;
}

export async function analyzeInterview(
  transcript: string,
  data: InterviewData
): Promise<AnalysisResponse> {
  try {
    // Normalize metrics to 0-100 scale
    const normalizedMetrics = {
      Posture: {
        backStraightness: normalizeScore(data.poseData.backStraightnessScore),
        headTilt: normalizeScore(100 - Math.abs(data.poseData.headTiltAngle)),
        bodyLean: normalizeScore(data.poseData.bodyLeanScore),
        stability: normalizeScore(data.poseData.stabilityIndex)
      },
      Emotion: {
        primaryEmotion: data.facialData.primaryEmotion,
        confidence: normalizeScore(data.facialData.emotionConfidence * 100),
        stability: normalizeScore(data.facialData.emotionalStability),
        engagement: normalizeScore(data.facialData.engagementLevel)
      },
      Voice: {
        clarity: normalizeScore(data.voiceData.clarityScore),
        speechRate: normalizeScore(data.voiceData.speechRate),
        tone: normalizeScore(data.voiceData.tonePolarity),
        volume: normalizeScore(data.voiceData.volumeConsistency),
        confidence: normalizeScore(data.voiceData.confidenceScore)
      }
    };

    // Calculate feedback based on metrics
    const feedback = {
      posture: calculatePostureFeedback(normalizedMetrics.Posture),
      emotion: calculateEmotionFeedback(normalizedMetrics.Emotion),
      tone: calculateVoiceFeedback(normalizedMetrics.Voice)
    };

    // Generate recommendations
    const recommendations = generateRecommendations(normalizedMetrics, feedback);

    return {
      metrics: normalizedMetrics,
      feedback,
      recommendations
    };
  } catch (error) {
    console.error('Error analyzing interview:', error);
    throw new Error('Failed to analyze interview');
  }
}

export async function saveAnalysis(
  userId: string,
  interviewId: string,
  analysis: AnalysisResponse
): Promise<void> {
  try {
    const { error } = await supabase
      .from('interview_analysis')
      .insert({
        user_id: userId,
        interview_id: interviewId,
        posture_score: analysis.metrics.Posture.backStraightness,
        emotion_score: analysis.metrics.Emotion.engagement,
        voice_score: analysis.metrics.Voice.clarity,
        feedback: analysis.feedback,
        recommendations: analysis.recommendations,
        created_at: new Date().toISOString()
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error saving analysis:', error);
    throw new Error('Failed to save analysis');
  }
}