import React, { useEffect, useRef, useState } from 'react'; 
import { analysisService } from '../services/analysis';
import { RealTimeMetrics } from '../types';
import InterviewMetrics from './InterviewMetrics';
import InterviewControls from './InterviewControls';

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

  useEffect(() => {
    // Initialize analysis service
    analysisService.initialize().catch(console.error);
  }, []);

  const startAnalysis = async () => {
    if (!videoRef.current) return;
    setIsAnalyzing(true);

    // Start webcam
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    } catch (error) {
      console.error('Error accessing webcam:', error);
      setIsAnalyzing(false);
      return;
    }

    // Start analysis loop
    const analyzeFrame = async () => {
      if (!videoRef.current || !isAnalyzing) return;

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
        console.error('Analysis error:', error);
      }

      requestAnimationFrame(analyzeFrame);
    };

    analyzeFrame();
  };

  const stopAnalysis = () => {
    setIsAnalyzing(false);
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
        <InterviewControls
          isAnalyzing={isAnalyzing}
          onStartAnalysis={startAnalysis}
          onStopAnalysis={stopAnalysis}
        />
      </div>
      <InterviewMetrics metrics={metrics} />
    </div>
  );
};