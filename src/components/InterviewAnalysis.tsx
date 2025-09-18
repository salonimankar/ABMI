import React, { useEffect, useRef, useState } from 'react';
import { analysisService } from '../services/analysis';
import { RealTimeMetrics } from '../types';
import { 
  Eye, Mic, Brain, Activity, TrendingUp, AlertCircle, 
  CheckCircle, XCircle, AlertTriangle, Volume2, 
  Users, MessageSquare, Target, Pause, Play, 
  ChevronDown, ChevronUp, BarChart3, Clock
} from 'lucide-react';

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
  const [mockMode, setMockMode] = useState(true); // Default to mock mode for demo
  const mockTimerRef = useRef<number | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  // Enhanced UI state
  const [isPaused, setIsPaused] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    vocal: true,
    bodyLanguage: true,
    content: true
  });
  const [alerts, setAlerts] = useState<string[]>([]);
  const [speechHistory, setSpeechHistory] = useState<number[]>([]);
  const [transcript, setTranscript] = useState<string>('');
  const [fillerWords, setFillerWords] = useState(0);
  const snapshotRef = useRef<RealTimeMetrics | null>(null);
  const changeTimerRef = useRef<number | null>(null);
  const [changePct, setChangePct] = useState({
    posture: { backStraightness: 0, stability: 0 },
    emotion: { confidence: 0, engagement: 0 },
    voice: { clarity: 0, confidence: 0 },
  });

  useEffect(() => {
    analysisService.initialize().catch(() => {});
  }, []);

  // Generate alerts when metrics change
  useEffect(() => {
    if (isAnalyzing) {
      generateAlerts();
    }
  }, [metrics, fillerWords]);

  const startMock = () => {
    stopMock();
    const emotions = ['neutral', 'happy', 'sad', 'angry', 'surprised'] as const;
    let timeElapsed = 0;
    mockTimerRef.current = window.setInterval(() => {
      timeElapsed += 0.1;
      setRecordingTime(timeElapsed);
      
      const newMetrics = {
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
      };

      setMetrics(newMetrics);
      updateSpeechHistory(newMetrics.voice.speechRate);
      
      // Simulate transcript updates
      if (Math.random() > 0.7) {
        const words = ['Hello', 'I', 'think', 'that', 'um', 'the', 'project', 'is', 'going', 'well'];
        const newWord = words[Math.floor(Math.random() * words.length)];
        setTranscript(prev => prev + (prev ? ' ' : '') + newWord);
        
        if (newWord === 'um' || newWord === 'uh') {
          setFillerWords(prev => prev + 1);
        }
      }
    }, 100);
    // start 5s change tracking in mock mode
    startChangeTracking();
  };

  const stopMock = () => {
    if (mockTimerRef.current) {
      clearInterval(mockTimerRef.current);
      mockTimerRef.current = null;
    }
    stopChangeTracking();
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
    startChangeTracking();
  };

  const stopAnalysis = () => {
    setIsAnalyzing(false);
    isAnalyzingRef.current = false;
    stopMock();
    stopChangeTracking();
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const computePct = (current: number, previous: number) => {
    // values may be 0..1 or 0..100; normalize to percentage points change
    const curr = current <= 1 ? current * 100 : current;
    const prev = previous <= 1 ? previous * 100 : previous;
    return Math.max(-100, Math.min(100, curr - prev));
  };

  const startChangeTracking = () => {
    // initialize snapshot immediately
    snapshotRef.current = metrics;
    if (changeTimerRef.current) window.clearInterval(changeTimerRef.current);
    changeTimerRef.current = window.setInterval(() => {
      const snap = snapshotRef.current;
      if (!snap) {
        snapshotRef.current = metrics;
        return;
      }
      const next = {
        posture: {
          backStraightness: computePct(metrics.posture.backStraightness, snap.posture.backStraightness),
          stability: computePct(metrics.posture.stability, snap.posture.stability),
        },
        emotion: {
          confidence: computePct(metrics.emotion.confidence, snap.emotion.confidence),
          engagement: computePct(metrics.emotion.engagement, snap.emotion.engagement),
        },
        voice: {
          clarity: computePct(metrics.voice.clarity, snap.voice.clarity),
          confidence: computePct(metrics.voice.confidence, snap.voice.confidence),
        },
      };
      setChangePct(next);
      snapshotRef.current = metrics;
    }, 5000);
  };

  const stopChangeTracking = () => {
    if (changeTimerRef.current) {
      window.clearInterval(changeTimerRef.current);
      changeTimerRef.current = null;
    }
    snapshotRef.current = null;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-400';
    if (score >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Enhanced status indicator system
  const getStatusIcon = (score: number, threshold: number = 0.7) => {
    if (score >= threshold) {
      return <CheckCircle className="h-4 w-4 text-green-400" />;
    } else if (score >= threshold * 0.6) {
      return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
    } else {
      return <XCircle className="h-4 w-4 text-red-400" />;
    }
  };

  const getStatusColor = (score: number, threshold: number = 0.7) => {
    if (score >= threshold) return 'border-green-400 bg-green-400/10';
    if (score >= threshold * 0.6) return 'border-yellow-400 bg-yellow-400/10';
    return 'border-red-400 bg-red-400/10';
  };

  // Generate actionable alerts
  const generateAlerts = () => {
    const newAlerts: string[] = [];
    
    if (metrics.posture.backStraightness < 70) {
      newAlerts.push("💡 Try to sit up straighter with shoulders relaxed");
    }
    if (metrics.posture.headTilt > 5) {
      newAlerts.push("💡 Keep your head level and centered");
    }
    if (metrics.emotion.confidence < 0.6) {
      newAlerts.push("💡 Maintain eye contact to project confidence");
    }
    if (metrics.voice.clarity < 0.6) {
      newAlerts.push("💡 Speak more clearly and enunciate your words");
    }
    if (metrics.voice.speechRate > 0.8) {
      newAlerts.push("💡 Slow down your speaking pace");
    }
    if (fillerWords > 5) {
      newAlerts.push("💡 Try to reduce filler words like 'um' and 'uh'");
    }
    
    setAlerts(newAlerts.slice(0, 3)); // Limit to 3 alerts
  };

  // Update speech history for real-time graphs
  const updateSpeechHistory = (rate: number) => {
    setSpeechHistory(prev => [...prev.slice(-19), rate]); // Keep last 20 data points
  };

  const DeltaBadge: React.FC<{ value: number }> = ({ value }) => {
    const sign = value > 0 ? '+' : value < 0 ? '' : '';
    const color = value > 0 ? 'text-emerald-400 bg-emerald-900/30' : value < 0 ? 'text-red-400 bg-red-900/30' : 'text-gray-300 bg-gray-800/40';
    return (
      <span className={`ml-2 inline-flex items-center px-1.5 py-0.5 rounded whitespace-nowrap text-[10px] ${color}`}>
        {sign}{Math.round(value)}%
      </span>
    );
  };

  // Build suggestions dynamically from live metrics
  const buildSuggestions = () => {
    const s: string[] = [];
    if (metrics.posture.backStraightness < 70) s.push('Sit up straighter to improve back alignment');
    if (metrics.posture.stability < 70) s.push('Reduce fidgeting to increase body stability');
    if (metrics.posture.bodyLean > 7) s.push('Keep your body centered; avoid leaning');
    if (metrics.posture.headTilt > 7) s.push('Level your head to face the camera');
    if (metrics.emotion.engagement < 0.6) s.push('Show a bit more facial engagement (nods, smiles)');
    if (metrics.emotion.confidence < 0.6) s.push('Maintain eye contact with the camera to convey confidence');
    if (metrics.voice.clarity < 0.6) s.push('Articulate clearly and open your mouth slightly more');
    if (metrics.voice.speechRate > 0.75) s.push('Slow down your speaking pace');
    if (metrics.voice.volume > 0.85) s.push('Lower your volume slightly');
    if (metrics.voice.volume < 0.4) s.push('Increase your volume a little');
    return s.slice(0, 5);
  };

  return (
    <div className="space-y-4">
      {/* Recording Status */}
      <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isAnalyzing ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}></div>
          <span className="text-sm font-medium">
            {isAnalyzing ? 'Recording & Analyzing' : 'Stopped'}
          </span>
        </div>
        <div className="text-sm text-gray-300">
          {formatTime(recordingTime)}
        </div>
      </div>

      {/* Live Metrics Grid - 3 Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Posture Analysis */}
        <div className="bg-gray-800/30 rounded-lg p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="h-6 w-6 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Posture</h3>
          </div>
          <div className="space-y-4 flex-1">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm font-medium">Back Straightness</span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${getScoreColor(metrics.posture.backStraightness / 100)}`}>
                    {Math.round(metrics.posture.backStraightness)}%
                  </span>
                  <DeltaBadge value={changePct.posture.backStraightness} />
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getScoreBg(metrics.posture.backStraightness / 100)}`}
                  style={{ width: `${metrics.posture.backStraightness}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm font-medium">Stability</span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${getScoreColor(metrics.posture.stability / 100)}`}>
                    {Math.round(metrics.posture.stability)}%
                  </span>
                  <DeltaBadge value={changePct.posture.stability} />
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getScoreBg(metrics.posture.stability / 100)}`}
                  style={{ width: `${metrics.posture.stability}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm font-medium">Head Tilt</span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${getScoreColor(1 - metrics.posture.headTilt / 10)}`}>
                    {Math.round(metrics.posture.headTilt)}°
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getScoreBg(1 - metrics.posture.headTilt / 10)}`}
                  style={{ width: `${Math.max(0, 100 - metrics.posture.headTilt * 10)}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm font-medium">Body Lean</span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${getScoreColor(1 - metrics.posture.bodyLean / 10)}`}>
                    {Math.round(metrics.posture.bodyLean)}°
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getScoreBg(1 - metrics.posture.bodyLean / 10)}`}
                  style={{ width: `${Math.max(0, 100 - metrics.posture.bodyLean * 10)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Emotion Analysis */}
        <div className="bg-gray-800/30 rounded-lg p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <Brain className="h-6 w-6 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Emotion</h3>
          </div>
          <div className="space-y-4 flex-1">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm font-medium">Primary Emotion</span>
                <span className="text-white text-sm font-semibold capitalize px-2 py-1 bg-gray-700 rounded">
                  {metrics.emotion.primaryEmotion}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm font-medium">Confidence</span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${getScoreColor(metrics.emotion.confidence)}`}>
                    {Math.round(metrics.emotion.confidence * 100)}%
                  </span>
                  <DeltaBadge value={changePct.emotion.confidence} />
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getScoreBg(metrics.emotion.confidence)}`}
                  style={{ width: `${metrics.emotion.confidence * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm font-medium">Engagement</span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${getScoreColor(metrics.emotion.engagement)}`}>
                    {Math.round(metrics.emotion.engagement * 100)}%
                  </span>
                  <DeltaBadge value={changePct.emotion.engagement} />
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getScoreBg(metrics.emotion.engagement)}`}
                  style={{ width: `${metrics.emotion.engagement * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm font-medium">Stability</span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${getScoreColor(metrics.emotion.stability)}`}>
                    {Math.round(metrics.emotion.stability * 100)}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getScoreBg(metrics.emotion.stability)}`}
                  style={{ width: `${metrics.emotion.stability * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Voice Analysis */}
        <div className="bg-gray-800/30 rounded-lg p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <Mic className="h-6 w-6 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Voice</h3>
          </div>
          <div className="space-y-4 flex-1">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm font-medium">Clarity</span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${getScoreColor(metrics.voice.clarity)}`}>
                    {Math.round(metrics.voice.clarity * 100)}%
                  </span>
                  <DeltaBadge value={changePct.voice.clarity} />
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getScoreBg(metrics.voice.clarity)}`}
                  style={{ width: `${metrics.voice.clarity * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm font-medium">Confidence</span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${getScoreColor(metrics.voice.confidence)}`}>
                    {Math.round(metrics.voice.confidence * 100)}%
                  </span>
                  <DeltaBadge value={changePct.voice.confidence} />
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getScoreBg(metrics.voice.confidence)}`}
                  style={{ width: `${metrics.voice.confidence * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm font-medium">Speech Rate</span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${getScoreColor(metrics.voice.speechRate)}`}>
                    {Math.round(metrics.voice.speechRate * 100)}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getScoreBg(metrics.voice.speechRate)}`}
                  style={{ width: `${metrics.voice.speechRate * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm font-medium">Tone</span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${getScoreColor(metrics.voice.tone)}`}>
                    {Math.round(metrics.voice.tone * 100)}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getScoreBg(metrics.voice.tone)}`}
                  style={{ width: `${metrics.voice.tone * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm font-medium">Volume</span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${getScoreColor(metrics.voice.volume)}`}>
                    {Math.round(metrics.voice.volume * 100)}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getScoreBg(metrics.voice.volume)}`}
                  style={{ width: `${metrics.voice.volume * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Feedback */}
      <div className="bg-gray-800/30 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-5 w-5 text-indigo-400" />
          <h3 className="font-semibold text-white">Live Feedback</h3>
        </div>
        <ul className="space-y-2 text-sm text-gray-300 list-disc pl-5">
          {buildSuggestions().map((msg, idx) => (
            <li key={idx} className="leading-snug whitespace-normal break-words">{msg}</li>
          ))}
          {buildSuggestions().length === 0 && (
            <li className="list-none text-green-400">Great performance! Keep it up</li>
          )}
        </ul>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <label className="inline-flex items-center gap-2 text-sm text-gray-300">
          <input
            type="checkbox"
            checked={mockMode}
            onChange={(e) => setMockMode(e.target.checked)}
            className="rounded"
          />
          Demo Mode
        </label>
        {!isAnalyzing ? (
          <button onClick={startAnalysis} className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
            Start Live Analysis
          </button>
        ) : (
          <button onClick={stopAnalysis} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors">
            Stop Analysis
          </button>
        )}
      </div>
    </div>
  );
};