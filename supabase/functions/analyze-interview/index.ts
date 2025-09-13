import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface InterviewData {
  transcript: string;
  videoData: {
    facialExpressions: {
      smile: number;
      attention: number;
      engagement: number;
    };
    headPose: {
      pitch: number;
      yaw: number;
      roll: number;
    };
    eyeGaze: {
      direction: [number, number];
      confidence: number;
    };
  };
  audioData: {
    volume: number;
    pitch: number[];
    wordsPerMinute: number;
    clarity: number;
  };
}

interface AnalysisResponse {
  metrics: {
    Confidence: number;
    Clarity: number;
    "Eye Contact": number;
    Engagement: number;
    "Speech Rate": number;
    "Response Quality": number;
    "Answer Structure": number;
  };
  recommendations: string[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { interviewData }: { interviewData: InterviewData } = await req.json();

    // Check if valid input is detected
    if (!interviewData || !interviewData.transcript || !interviewData.videoData || !interviewData.audioData) {
      return new Response(
        JSON.stringify({
          metrics: {
            "Confidence": 0,
            "Clarity": 0,
            "Eye Contact": 0,
            "Engagement": 0,
            "Speech Rate": 0,
            "Response Quality": 0,
            "Answer Structure": 0
          },
          message: "No clear response detected."
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Calculate metrics
    const confidenceScore = calculateConfidence(interviewData);
    const clarityScore = calculateClarity(interviewData);
    const eyeContactScore = calculateEyeContact(interviewData);
    const engagementScore = calculateEngagement(interviewData);
    const speechRateScore = calculateSpeechRate(interviewData);
    const responseQualityScore = calculateResponseQuality(interviewData);
    const answerStructureScore = calculateAnswerStructure(interviewData);

    // Generate recommendations
    const recommendations = generateRecommendations({
      confidence: confidenceScore,
      clarity: clarityScore,
      eyeContact: eyeContactScore,
      engagement: engagementScore,
      speechRate: speechRateScore,
      responseQuality: responseQualityScore,
      answerStructure: answerStructureScore,
    });

    const response: AnalysisResponse = {
      metrics: {
        "Confidence": confidenceScore,
        "Clarity": clarityScore,
        "Eye Contact": eyeContactScore,
        "Engagement": engagementScore,
        "Speech Rate": speechRateScore,
        "Response Quality": responseQualityScore,
        "Answer Structure": answerStructureScore
      },
      recommendations
    };

    return new Response(
      JSON.stringify(response),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});

function calculateConfidence(data: InterviewData): number {
  const { videoData, audioData } = data;
  
  // Combine facial expressions, posture, and voice metrics
  const expressionConfidence = videoData.facialExpressions.engagement * 100;
  const postureConfidence = (1 - Math.abs(videoData.headPose.roll) / 45) * 100;
  const voiceConfidence = audioData.volume * 100;
  
  // Weight and combine scores
  return Math.round(
    expressionConfidence * 0.4 +
    postureConfidence * 0.3 +
    voiceConfidence * 0.3
  );
}

function calculateClarity(data: InterviewData): number {
  const { audioData, transcript } = data;
  
  // Analyze speech clarity and articulation
  const audioClarity = audioData.clarity * 100;
  
  // Check for filler words
  const fillerWords = (transcript.match(/\b(um|uh|like|you know|basically)\b/gi) || []).length;
  const fillerPenalty = Math.min(30, fillerWords * 5);
  
  return Math.round(Math.max(0, audioClarity - fillerPenalty));
}

function calculateEyeContact(data: InterviewData): number {
  const { videoData } = data;
  
  // Calculate gaze direction alignment with camera
  const gazeScore = (1 - Math.abs(videoData.eyeGaze.direction[0]) / 45) * 100;
  const gazeConfidence = videoData.eyeGaze.confidence * 100;
  
  return Math.round((gazeScore * 0.7 + gazeConfidence * 0.3));
}

function calculateEngagement(data: InterviewData): number {
  const { videoData } = data;
  
  // Combine facial engagement and attention metrics
  const facialEngagement = videoData.facialExpressions.engagement * 100;
  const attention = videoData.facialExpressions.attention * 100;
  const smileScore = videoData.facialExpressions.smile * 100;
  
  return Math.round(
    facialEngagement * 0.4 +
    attention * 0.4 +
    smileScore * 0.2
  );
}

function calculateSpeechRate(data: InterviewData): number {
  const { audioData } = data;
  const wpm = audioData.wordsPerMinute;
  
  // Optimal range: 110-150 WPM
  if (wpm < 110) {
    return Math.round((wpm / 110) * 100);
  } else if (wpm > 150) {
    return Math.round(Math.max(0, 100 - ((wpm - 150) / 2)));
  }
  
  return 100;
}

function calculateResponseQuality(data: InterviewData): number {
  const { transcript } = data;
  
  // Analyze response completeness and relevance
  const wordCount = transcript.split(' ').length;
  const sentenceCount = transcript.split(/[.!?]+/).length;
  
  // Penalize very short responses
  if (wordCount < 20) {
    return Math.round((wordCount / 20) * 100);
  }
  
  // Analyze response structure
  const avgWordsPerSentence = wordCount / sentenceCount;
  const structurePenalty = Math.abs(avgWordsPerSentence - 15) * 2;
  
  return Math.round(Math.max(0, 100 - structurePenalty));
}

function calculateAnswerStructure(data: InterviewData): number {
  const { transcript } = data;
  
  // Split into sentences
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  if (sentences.length < 2) {
    return Math.round((sentences.length / 2) * 100);
  }
  
  // Check for introduction and conclusion
  const hasIntro = sentences[0].length > 20;
  const hasConclusion = sentences[sentences.length - 1].length > 20;
  
  // Check for logical flow using transition words
  const transitionWords = /\b(however|therefore|furthermore|moreover|in addition|consequently|first|second|finally|in conclusion)\b/gi;
  const transitionCount = (transcript.match(transitionWords) || []).length;
  
  const structureScore = 
    (hasIntro ? 30 : 0) +
    (hasConclusion ? 30 : 0) +
    Math.min(40, transitionCount * 10);
  
  return Math.round(structureScore);
}

function generateRecommendations(scores: Record<string, number>): string[] {
  const recommendations: string[] = [];
  
  if (scores.confidence < 70) {
    recommendations.push(
      "Work on maintaining a more confident posture and tone of voice. Keep your head up and speak with conviction."
    );
  }
  
  if (scores.clarity < 70) {
    recommendations.push(
      "Focus on speaking more clearly and reducing filler words. Take brief pauses instead of using words like 'um' or 'uh'."
    );
  }
  
  if (scores.eyeContact < 70) {
    recommendations.push(
      "Try to maintain more consistent eye contact with the camera. This helps establish a stronger connection with your interviewer."
    );
  }
  
  if (scores.engagement < 70) {
    recommendations.push(
      "Show more engagement through facial expressions and vocal energy. Use natural hand gestures and vary your tone to maintain interest."
    );
  }
  
  if (scores.speechRate < 70) {
    recommendations.push(
      "Adjust your speaking pace to be more natural. Aim for 120-140 words per minute for optimal clarity and engagement."
    );
  }
  
  if (scores.responseQuality < 70) {
    recommendations.push(
      "Provide more detailed and relevant responses. Include specific examples and ensure your answers directly address the questions."
    );
  }
  
  if (scores.answerStructure < 70) {
    recommendations.push(
      "Structure your answers more effectively using the STAR method: Situation, Task, Action, and Result. Include a clear introduction and conclusion."
    );
  }
  
  return recommendations;
}