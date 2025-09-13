import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface SpeechData {
  transcript: string;
  duration: number;
  volume: number[];
  pitch: number[];
  pace: number;
}

interface AnalysisResponse {
  clarity: number;
  speechRate: number;
  volume: number;
  recommendations: string[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { speechData }: { speechData: SpeechData } = await req.json();

    // Analyze speech metrics
    const clarityScore = analyzeSpeechClarity(speechData.transcript);
    const speechRateScore = analyzeSpeechRate(speechData.duration, speechData.transcript, speechData.pace);
    const volumeScore = analyzeVolume(speechData.volume);

    // Generate recommendations
    const recommendations = generateRecommendations(clarityScore, speechRateScore, volumeScore, speechData);

    const response: AnalysisResponse = {
      clarity: clarityScore,
      speechRate: speechRateScore,
      volume: volumeScore,
      recommendations,
    };

    return new Response(JSON.stringify(response), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});

function analyzeSpeechClarity(transcript: string): number {
  // Analyze speech clarity based on transcript
  const words = transcript.split(' ');
  const fillerWords = words.filter(word => 
    /\b(um|uh|like|you know|basically|actually|literally)\b/i.test(word)
  ).length;

  const fillerRatio = fillerWords / words.length;
  const clarityScore = Math.max(0, Math.min(100, 100 - (fillerRatio * 200)));
  
  return Math.round(clarityScore);
}

function analyzeSpeechRate(duration: number, transcript: string, pace: number): number {
  // Calculate words per minute
  const words = transcript.split(' ').length;
  const minutes = duration / 60;
  const wpm = words / minutes;

  // Ideal range: 130-160 WPM
  const optimalWPM = 145;
  const deviation = Math.abs(wpm - optimalWPM);
  const paceScore = Math.max(0, Math.min(100, 100 - (deviation / 2)));

  // Consider pace variation
  const paceVariationScore = 100 - Math.abs(pace - 1) * 50;

  return Math.round((paceScore * 0.7 + paceVariationScore * 0.3));
}

function analyzeVolume(volume: number[]): number {
  if (volume.length === 0) return 0;

  // Calculate volume consistency
  const avgVolume = volume.reduce((a, b) => a + b, 0) / volume.length;
  const variance = volume.reduce((acc, val) => acc + Math.pow(val - avgVolume, 2), 0) / volume.length;
  
  // Penalize too quiet or too loud
  const volumeLevel = Math.max(0, Math.min(100, avgVolume * 100));
  const consistencyScore = Math.max(0, 100 - (Math.sqrt(variance) * 10));

  return Math.round((volumeLevel * 0.6 + consistencyScore * 0.4));
}

function generateRecommendations(clarity: number, speechRate: number, volume: number, speechData: SpeechData): string[] {
  const recommendations = [];

  if (clarity < 70) {
    recommendations.push(
      "Try to reduce filler words like 'um', 'uh', and 'like'. Take brief pauses instead when gathering your thoughts."
    );
  }

  if (speechRate < 70) {
    const wpm = (speechData.transcript.split(' ').length / (speechData.duration / 60));
    if (wpm > 160) {
      recommendations.push(
        "You're speaking a bit too quickly. Try to slow down and give your words more space."
      );
    } else if (wpm < 130) {
      recommendations.push(
        "Try to pick up your pace slightly while maintaining clarity."
      );
    }
  }

  if (volume < 70) {
    const avgVolume = speechData.volume.reduce((a, b) => a + b, 0) / speechData.volume.length;
    if (avgVolume < 0.5) {
      recommendations.push(
        "Speak up a bit more confidently. Your voice should be clear and projecting."
      );
    } else if (avgVolume > 0.8) {
      recommendations.push(
        "Try to moderate your volume slightly. You want to be clearly heard without being too loud."
      );
    }
  }

  return recommendations;
}