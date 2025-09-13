import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { getRandomQuestion, type Question } from '../lib/questions';
import { analyzeInterview, saveAnalysis } from '../lib/analysis';
import { toast } from 'sonner';
import { AppError } from '../lib/errors';

interface InterviewMetrics {
  Confidence: number;
  Clarity: number;
  EyeContact: number;
  Engagement: number;
  SpeechRate: number;
  ResponseQuality: number;
  AnswerStructure: number;
}

export function useInterview() {
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [transcript, setTranscript] = useState<string>('');
  const [metrics, setMetrics] = useState<InterviewMetrics>({
    Confidence: 0,
    Clarity: 0,
    EyeContact: 0,
    Engagement: 0,
    SpeechRate: 0,
    ResponseQuality: 0,
    AnswerStructure: 0,
  });
  const [feedback, setFeedback] = useState<string[]>([]);
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Refs for real-time analysis
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
  const analysisIntervalRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      stopAllMedia();
    };
  }, []);

  const stopAllMedia = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
    }
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      mediaStreamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
      toast.error('Failed to start recording');
    }
  };

  const stopRecording = async () => {
    try {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        stopAllMedia();
        
        // Save recording
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const file = new File([blob], `interview-${Date.now()}.webm`, { type: 'video/webm' });
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('recordings')
          .upload(`${user?.id}/${file.name}`, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('recordings')
          .getPublicUrl(uploadData.path);

        // Save recording metadata
        const { error: recordingError } = await supabase
          .from('recordings')
          .insert({
            interview_id: interviewId,
            user_id: user?.id,
            video_url: publicUrl,
            transcript,
            duration: `${Math.round(blob.size / (1024 * 1024))} minutes`,
          });

        if (recordingError) throw recordingError;

        setIsRecording(false);
        recordedChunksRef.current = [];
        toast.success('Recording saved successfully');
      }
    } catch (err) {
      console.error('Error stopping recording:', err);
      toast.error('Failed to save recording');
    }
  };

  const startAnalysis = useCallback(() => {
    if (!videoRef.current) return;

    analysisIntervalRef.current = setInterval(async () => {
      try {
        // Get video analysis data
        const videoData = {
          facingCamera: true, // This would come from face detection
          speakingPace: transcript.split(' ').length / (Date.now() - startTime) * 60000,
          voiceVolume: 0.8, // This would come from audio analysis
        };

        const analysis = await analyzeInterview(transcript, videoData);
        setMetrics(analysis.metrics);
        setFeedback(analysis.feedback);
      } catch (err) {
        console.error('Analysis error:', err);
      }
    }, 2000) as unknown as number;
  }, [transcript]);

  const stopAnalysis = useCallback(() => {
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
  }, []);

  const startInterview = async (type: string, difficulty: string) => {
    try {
      setLoading(true);
      const { data, error: createError } = await supabase
        .from('interviews')
        .insert({
          user_id: user?.id,
          title: `${type} Interview - ${new Date().toLocaleDateString()}`,
          type,
          difficulty_level: difficulty,
          interview_type: type.toLowerCase(),
        })
        .select()
        .single();

      if (createError) throw new AppError('Failed to create interview', 'DATABASE_ERROR');
      
      setInterviewId(data.id);
      await loadNextQuestion(type, difficulty);
      await startRecording();
      toast.success('Interview session started');
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to start interview';
      setError(error);
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };

  const endInterview = async () => {
    try {
      await stopRecording();
      await saveFeedback();
      toast.success('Interview ended successfully');
    } catch (err) {
      console.error('Error ending interview:', err);
      toast.error('Failed to end interview');
    }
  };

  const loadNextQuestion = async (type: string, difficulty: string) => {
    try {
      const question = getRandomQuestion(type as Question['category'], difficulty as Question['difficulty']);
      setCurrentQuestion(question);
      setQuestionNumber(prev => prev + 1);
    } catch (err) {
      const error = 'Failed to load next question';
      setError(error);
      toast.error(error);
    }
  };

  const saveFeedback = async () => {
    if (!interviewId || !user) return;

    try {
      await saveAnalysis(interviewId, metrics, feedback);
      toast.success('Feedback saved successfully');
    } catch (err) {
      const error = 'Failed to save feedback';
      setError(error);
      toast.error(error);
    }
  };

  return {
    isRecording,
    currentQuestion,
    questionNumber,
    transcript,
    metrics,
    feedback,
    loading,
    error,
    startInterview,
    endInterview,
    loadNextQuestion,
    saveFeedback,
    videoRef,
  };
}