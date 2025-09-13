import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '86400',
};

interface FacialData {
  eyeContact: number;
  smileScore: number;
  headPose: {
    pitch: number;
    yaw: number;
    roll: number;
  };
  landmarks: number[][];
  emotions: {
    neutral: number;
    happy: number;
    sad: number;
    angry: number;
    surprised: number;
    fearful: number;
    disgusted: number;
  };
  bodyPose: {
    shoulders: number[][];
    arms: number[][];
    hands: number[][];
    posture: number;
  };
  gestures: {
    type: string;
    confidence: number;
    duration: number;
  }[];
}

interface AnalysisResponse {
  confidence: number;
  engagement: number;
  eyeContact: number;
  emotionalState: {
    primary: string;
    secondary: string;
    intensity: number;
  };
  bodyLanguage: {
    posture: number;
    gestures: {
      type: string;
      frequency: number;
      appropriateness: number;
    }[];
    overall: number;
  };
  performance: {
    communication: number;
    presence: number;
    professionalism: number;
  };
  recommendations: {
    immediate: string[];
    longTerm: string[];
  };
  metrics: {
    eyeContactTrend: number[];
    engagementTrend: number[];
    confidenceTrend: number[];
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests first
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        ...corsHeaders,
      },
    });
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Parse and validate request body
    let facialData: FacialData;
    try {
      const body = await req.json();
      facialData = body.facialData;

      if (!facialData || !validateFacialData(facialData)) {
        throw new Error('Invalid facial data format');
      }
    } catch (parseError) {
      return new Response(
        JSON.stringify({ error: 'Invalid request body', details: parseError.message }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Process all aspects of the analysis
    const analysis = await processAnalysis(facialData);

    return new Response(
      JSON.stringify(analysis),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Function error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
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

function validateFacialData(data: FacialData): boolean {
  return (
    typeof data.eyeContact === 'number' &&
    typeof data.smileScore === 'number' &&
    data.headPose &&
    Array.isArray(data.landmarks) &&
    data.emotions &&
    data.bodyPose &&
    Array.isArray(data.gestures)
  );
}

async function processAnalysis(data: FacialData): Promise<AnalysisResponse> {
  const eyeContactScore = calculateEyeContact(data.eyeContact, data.headPose);
  const engagementScore = calculateEngagement(data.smileScore, data.landmarks, data.emotions);
  const confidenceScore = calculateConfidence(data.headPose, data.landmarks, data.bodyPose);
  const emotionalState = analyzeEmotionalState(data.emotions);
  const bodyLanguage = analyzeBodyLanguage(data.bodyPose, data.gestures);
  const performance = calculatePerformance(data);
  const recommendations = generateRecommendations(eyeContactScore, engagementScore, confidenceScore, bodyLanguage, emotionalState);
  const metrics = calculateMetrics(data);

  return {
    confidence: confidenceScore,
    engagement: engagementScore,
    eyeContact: eyeContactScore,
    emotionalState,
    bodyLanguage,
    performance,
    recommendations,
    metrics,
  };
}

function calculateEyeContact(eyeContact: number, headPose: { pitch: number; yaw: number; roll: number }): number {
  const gazeScore = Math.max(0, Math.min(100, eyeContact * 100));
  const poseImpact = Math.max(0, 100 - (Math.abs(headPose.yaw) + Math.abs(headPose.pitch)) * 2);
  return Math.round((gazeScore * 0.7 + poseImpact * 0.3));
}

function calculateEngagement(smileScore: number, landmarks: number[][], emotions: FacialData['emotions']): number {
  const expressionScore = Math.max(0, Math.min(100, smileScore * 100));
  const movementScore = calculateMovementScore(landmarks);
  const emotionalEngagement = calculateEmotionalEngagement(emotions);
  return Math.round((expressionScore * 0.4 + movementScore * 0.3 + emotionalEngagement * 0.3));
}

function calculateConfidence(
  headPose: { pitch: number; yaw: number; roll: number },
  landmarks: number[][],
  bodyPose: FacialData['bodyPose']
): number {
  const postureScore = Math.max(0, 100 - (Math.abs(headPose.roll) * 3));
  const stabilityScore = calculateStabilityScore(landmarks);
  const bodyConfidence = calculateBodyConfidence(bodyPose);
  return Math.round((postureScore * 0.3 + stabilityScore * 0.3 + bodyConfidence * 0.4));
}

function analyzeEmotionalState(emotions: FacialData['emotions']): AnalysisResponse['emotionalState'] {
  const entries = Object.entries(emotions);
  const sorted = entries.sort(([, a], [, b]) => b - a);
  const [primary, secondary] = sorted;
  
  return {
    primary: primary[0],
    secondary: secondary[0],
    intensity: Math.round(primary[1] * 100),
  };
}

function analyzeBodyLanguage(
  bodyPose: FacialData['bodyPose'],
  gestures: FacialData['gestures']
): AnalysisResponse['bodyLanguage'] {
  const postureScore = bodyPose.posture;
  const gestureAnalysis = analyzeGestures(gestures);
  
  return {
    posture: postureScore,
    gestures: gestureAnalysis,
    overall: calculateOverallBodyLanguage(postureScore, gestureAnalysis),
  };
}

function analyzeGestures(gestures: FacialData['gestures']) {
  const gestureMap = new Map<string, { count: number; totalConfidence: number }>();
  
  gestures.forEach(gesture => {
    const existing = gestureMap.get(gesture.type) || { count: 0, totalConfidence: 0 };
    gestureMap.set(gesture.type, {
      count: existing.count + 1,
      totalConfidence: existing.totalConfidence + gesture.confidence,
    });
  });

  return Array.from(gestureMap.entries()).map(([type, data]) => ({
    type,
    frequency: data.count,
    appropriateness: Math.round((data.totalConfidence / data.count) * 100),
  }));
}

function calculatePerformance(data: FacialData): AnalysisResponse['performance'] {
  return {
    communication: calculateCommunicationScore(data),
    presence: calculatePresenceScore(data),
    professionalism: calculateProfessionalismScore(data),
  };
}

function generateRecommendations(
  eyeContact: number,
  engagement: number,
  confidence: number,
  bodyLanguage: AnalysisResponse['bodyLanguage'],
  emotionalState: AnalysisResponse['emotionalState']
): AnalysisResponse['recommendations'] {
  const immediate: string[] = [];
  const longTerm: string[] = [];

  // Eye contact recommendations
  if (eyeContact < 70) {
    immediate.push("Try to maintain more consistent eye contact with the camera.");
    longTerm.push("Practice maintaining eye contact in front of a mirror or with friends.");
  }

  // Engagement recommendations
  if (engagement < 70) {
    immediate.push("Show more engagement through natural facial expressions and gestures.");
    longTerm.push("Record yourself speaking and analyze your engagement patterns.");
  }

  // Confidence recommendations
  if (confidence < 70) {
    immediate.push("Work on your posture and head position.");
    longTerm.push("Practice power poses before interviews to boost confidence.");
  }

  // Body language recommendations
  if (bodyLanguage.overall < 70) {
    immediate.push("Be mindful of your gestures and body posture.");
    longTerm.push("Take a public speaking or body language workshop.");
  }

  // Emotional state recommendations
  if (emotionalState.intensity > 80) {
    immediate.push("Try to maintain a more balanced emotional expression.");
    longTerm.push("Practice emotional regulation techniques before interviews.");
  }

  return { immediate, longTerm };
}

function calculateMetrics(data: FacialData): AnalysisResponse['metrics'] {
  return {
    eyeContactTrend: calculateTrend(data.eyeContact),
    engagementTrend: calculateTrend(data.smileScore),
    confidenceTrend: calculateTrend(data.bodyPose.posture),
  };
}

function calculateTrend(value: number): number[] {
  // In a real implementation, this would use historical data
  return [value, value * 0.95, value * 0.9];
}

function calculateEmotionalEngagement(emotions: FacialData['emotions']): number {
  const positiveEmotions = emotions.happy + emotions.surprised;
  const negativeEmotions = emotions.sad + emotions.angry + emotions.fearful + emotions.disgusted;
  return Math.max(0, Math.min(100, (positiveEmotions - negativeEmotions) * 100));
}

function calculateBodyConfidence(bodyPose: FacialData['bodyPose']): number {
  const shoulderAlignment = calculateAlignment(bodyPose.shoulders);
  const armPosition = calculateArmPosition(bodyPose.arms);
  return Math.round((shoulderAlignment * 0.6 + armPosition * 0.4));
}

function calculateAlignment(points: number[][]): number {
  if (points.length < 2) return 0;
  const [left, right] = points;
  const alignment = Math.abs(left[1] - right[1]);
  return Math.max(0, Math.min(100, 100 - alignment * 10));
}

function calculateArmPosition(arms: number[][]): number {
  if (arms.length < 2) return 0;
  const [left, right] = arms;
  const openness = Math.abs(left[0] - right[0]);
  return Math.max(0, Math.min(100, openness * 10));
}

function calculateOverallBodyLanguage(
  postureScore: number,
  gestures: AnalysisResponse['bodyLanguage']['gestures']
): number {
  const gestureScore = gestures.reduce((acc, g) => acc + g.appropriateness, 0) / gestures.length;
  return Math.round((postureScore * 0.6 + gestureScore * 0.4));
}

function calculateCommunicationScore(data: FacialData): number {
  const verbalClarity = calculateVerbalClarity(data);
  const nonVerbalClarity = calculateNonVerbalClarity(data);
  return Math.round((verbalClarity * 0.5 + nonVerbalClarity * 0.5));
}

function calculatePresenceScore(data: FacialData): number {
  const physicalPresence = calculatePhysicalPresence(data);
  const emotionalPresence = calculateEmotionalPresence(data);
  return Math.round((physicalPresence * 0.5 + emotionalPresence * 0.5));
}

function calculateProfessionalismScore(data: FacialData): number {
  const appearance = calculateAppearanceScore(data);
  const behavior = calculateBehaviorScore(data);
  return Math.round((appearance * 0.4 + behavior * 0.6));
}

// Helper functions for performance metrics
function calculateVerbalClarity(data: FacialData): number {
  // Implementation would analyze speech patterns
  return 75;
}

function calculateNonVerbalClarity(data: FacialData): number {
  return Math.round((data.bodyPose.posture * 0.6 + data.eyeContact * 0.4));
}

function calculatePhysicalPresence(data: FacialData): number {
  return Math.round((data.bodyPose.posture * 0.7 + data.headPose.roll * 0.3));
}

function calculateEmotionalPresence(data: FacialData): number {
  return Math.round((data.smileScore * 0.5 + data.eyeContact * 0.5));
}

function calculateAppearanceScore(data: FacialData): number {
  return Math.round((data.bodyPose.posture * 0.8 + data.headPose.roll * 0.2));
}

function calculateBehaviorScore(data: FacialData): number {
  return Math.round((data.eyeContact * 0.6 + data.smileScore * 0.4));
}

function calculateMovementScore(landmarks: number[][]): number {
  const movementVariance = calculateLandmarkVariance(landmarks);
  return Math.max(0, Math.min(100, 100 - movementVariance * 2));
}

function calculateStabilityScore(landmarks: number[][]): number {
  const stabilityVariance = calculateLandmarkVariance(landmarks);
  return Math.max(0, Math.min(100, 100 - stabilityVariance * 3));
}

function calculateLandmarkVariance(landmarks: number[][]): number {
  if (landmarks.length < 2) return 0;
  
  const differences = [];
  for (let i = 1; i < landmarks.length; i++) {
    const diff = landmarks[i].map((val, idx) => Math.abs(val - landmarks[i-1][idx]));
    differences.push(Math.max(...diff));
  }
  
  return differences.reduce((a, b) => a + b, 0) / differences.length;
}