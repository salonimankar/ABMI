import React, { useEffect, useRef, useState } from 'react'; 
import { analysisService } from '../services/analysis';
import { RealTimeMetrics } from '../types';

export const InterviewAnalysis: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [metrics, setMetrics] = useState<RealTimeMetrics>({
    posture: {
      backStraightness: 0,
      headTilt: 0,
      bodyLean: 0,
      stability: 0,
    },
    emotion: {
      primaryEmotion: 'neutral',
      confidence: 0,
      stability: 0,
      engagement: 0,
    },
    voice: {
      clarity: 0,
      speechRate: 0,
      tone: 0,
      volume: 0,
      confidence: 0,
    },
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const isAnalyzingRef = useRef(false);
  const [mockMode, setMockMode] = useState(false);
  const mockTimerRef = useRef<number | null>(null);

  useEffect(() => {
    analysisService.initialize().catch(() => {});
  }, []);

  const startMock = () => {
    stopMock();
    const emotions = ['neutral', 'happy', 'sad', 'angry', 'surprised'] as const;
    mockTimerRef.current = window.setInterval(() => {
      setMetrics({
        posture: {
          backStraightness: 70 + Math.random() * 30,
          headTilt: Math.random() * 10,
          bodyLean: Math.random() * 10,
          stability: 70 + Math.random() * 30,
        },
        emotion: {
          primaryEmotion: emotions[Math.floor(Math.random() * emotions.length)] as any,
          confidence: 0.6 + Math.random() * 0.4,
          stability: 0.6 + Math.random() * 0.4,
          engagement: 0.6 + Math.random() * 0.4,
        },
        voice: {
          clarity: 0.6 + Math.random() * 0.4,
          speechRate: 0.6 + Math.random() * 0.4,
          tone: 0.6 + Math.random() * 0.4,
          volume: 0.6 + Math.random() * 0.4,
          confidence: 0.6 + Math.random() * 0.4,
        },
      });
    }, 100);
  };

  const stopMock = () => {
    if (mockTimerRef.current) {
      clearInterval(mockTimerRef.current);
      mockTimerRef.current = null;
    }
  };

  const startAnalysis = async () => {
    if (mockMode) {
      setIsAnalyzing(true);
      isAnalyzingRef.current = true;
      startMock();
      return;
    }

    if (!videoRef.current) return;
    setIsAnalyzing(true);
    isAnalyzingRef.current = true;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      await videoRef.current.play().catch(() => {});
    } catch (error) {
      console.error('Error accessing webcam:', error);
      setIsAnalyzing(false);
      isAnalyzingRef.current = false;
      return;
    }

    const analyzeFrame = async () => {
      if (!videoRef.current || !isAnalyzingRef.current) return;

      try {
        const [posture, emotion] = await Promise.all([
          analysisService.analyzePose(videoRef.current),
          analysisService.analyzeFacialExpressions(videoRef.current),
        ]);

        setMetrics(prev => ({
          ...prev,
          posture,
          emotion,
        }));
      } catch (error) {
        // Swallow frame errors to keep loop running
      }

      requestAnimationFrame(analyzeFrame);
    };

    analyzeFrame();
  };

  const stopAnalysis = () => {
    setIsAnalyzing(false);
    isAnalyzingRef.current = false;
    stopMock();
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={mockMode}
              onChange={(e) => setMockMode(e.target.checked)}
            />
            Mock mode
          </label>
          {!isAnalyzing ? (
            <button onClick={startAnalysis} className="px-4 py-2 rounded-lg bg-emerald-600 text-white">Start Analysis</button>
          ) : (
            <button onClick={stopAnalysis} className="px-4 py-2 rounded-lg bg-red-600 text-white">Stop Analysis</button>
          )}
        </div>
      </div>
      <div className="space-y-3 text-sm">
        <div>
          <div className="font-semibold mb-1">Posture</div>
          <div>Back straightness: {metrics.posture.backStraightness.toFixed(2)}</div>
          <div>Head tilt: {metrics.posture.headTilt.toFixed(2)}</div>
          <div>Body lean: {metrics.posture.bodyLean.toFixed(2)}</div>
          <div>Stability: {metrics.posture.stability.toFixed(2)}</div>
        </div>
        <div>
          <div className="font-semibold mb-1">Emotion</div>
          <div>Primary: {metrics.emotion.primaryEmotion}</div>
          <div>Confidence: {metrics.emotion.confidence.toFixed(2)}</div>
          <div>Stability: {metrics.emotion.stability.toFixed(2)}</div>
          <div>Engagement: {metrics.emotion.engagement.toFixed(2)}</div>
        </div>
        <div>
          <div className="font-semibold mb-1">Voice</div>
          <div>Clarity: {metrics.voice.clarity.toFixed(2)}</div>
          <div>Speech rate: {metrics.voice.speechRate.toFixed(2)}</div>
          <div>Tone: {metrics.voice.tone.toFixed(2)}</div>
          <div>Volume: {metrics.voice.volume.toFixed(2)}</div>
          <div>Confidence: {metrics.voice.confidence.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
};