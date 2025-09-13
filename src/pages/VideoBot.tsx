import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Video,
  Brain,
  MessageSquare,
  Volume2,
  Settings,
  Eye,
  Timer,
  BarChart3,
  Languages,
  AlertCircle,
  X,
  Send,
  Camera,
  Sliders,
  Keyboard,
  Maximize2,
  VolumeX,
  ChevronRight,
} from 'lucide-react';
import { useInterview } from '../hooks/useInterview';
import { useTranslation } from 'react-i18next';
import Webcam from 'react-webcam';
import { toast } from 'sonner';
import DocumentAnalysis from '../components/DocumentAnalysis';
import QuestionModal from '../components/QuestionModal';

function VideoBot() {
  const { t } = useTranslation();
  const {
    isRecording,
    currentQuestion,
    questionNumber,
    transcript,
    metrics,
    feedback,
    loading,
    error,
    startInterview,
    toggleRecording,
    loadNextQuestion,
    saveFeedback,
  } = useInterview();

  const [showTranscript, setShowTranscript] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', message: 'Hi! I\'m your AI interview assistant. How can I help you today?' },
  ]);
  const [sessionTime, setSessionTime] = useState(0);
  const [interviewType, setInterviewType] = useState('technical');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [hasPermissions, setHasPermissions] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);
  const [customQuestions, setCustomQuestions] = useState<string[]>([]);
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const webcamRef = useRef<Webcam>(null);

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user"
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    if (isRecording && !audioContext) {
      const context = new AudioContext();
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          setAudioStream(stream);
          const source = context.createMediaStreamSource(stream);
          const echoCancellation = context.createGain();
          echoCancellation.gain.value = 0.5;
          source.connect(echoCancellation);
          echoCancellation.connect(context.destination);
          setAudioContext(context);
        })
        .catch(err => {
          console.error('Error accessing microphone:', err);
          toast.error('Failed to access microphone');
        });
    }

    return () => {
      if (audioContext) {
        audioContext.close();
        setAudioContext(null);
      }
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
        setAudioStream(null);
      }
    };
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const requestPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop the stream immediately
      setHasPermissions(true);
      return true;
    } catch (err) {
      console.error('Permission error:', err);
      toast.error(
        'Camera and microphone access is required for the interview. Please enable permissions and try again.',
        {
          duration: 5000,
          action: {
            label: 'Settings',
            onClick: () => window.open('chrome://settings/content/camera', '_blank'),
          },
        }
      );
      return false;
    }
  };

  const handleStartInterview = async () => {
    if (!hasPermissions) {
      const granted = await requestPermissions();
      if (!granted) return;
    }

    try {
      await startInterview(interviewType, difficulty);
      setShowWebcam(true);
    } catch (err) {
      console.error('Failed to start interview:', err);
      toast.error('Failed to start interview. Please try again.');
    }
  };

  const handleEndInterview = async () => {
    try {
      setShowWebcam(false);
      // Additional cleanup logic here
      toast.success('Interview session ended successfully');
    } catch (err) {
      console.error('Error ending interview:', err);
      toast.error('Failed to end interview session');
    }
  };

  const sendMessage = () => {
    if (!chatMessage.trim()) return;

    setChatHistory([
      ...chatHistory,
      { role: 'user', message: chatMessage },
      { role: 'assistant', message: 'Thank you for your question! I\'m analyzing your interview performance and will provide specific feedback to help you improve.' }
    ]);
    setChatMessage('');
  };

  const handleNextQuestion = async () => {
    await saveFeedback();
    await loadNextQuestion(interviewType, difficulty);
  };

  const handleQuestionsGenerated = (questions: string[]) => {
    setCustomQuestions(questions);
    setShowQuestionsModal(true);
  };

  const handleQuestionSelect = (question: string) => {
    toast.success('Question updated');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 flex items-center gap-2">
          <AlertCircle className="h-6 w-6" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">AI Interview Assistant</h1>
          <p className="text-muted-foreground mt-2">
            Practice and improve your interview skills with real-time AI feedback
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 rounded-lg bg-secondary flex items-center gap-2">
            <Timer className="h-4 w-4" />
            <span>Session: {formatTime(sessionTime)}</span>
          </div>
          <button 
            onClick={showWebcam ? handleEndInterview : handleStartInterview}
            className={`px-4 py-2 rounded-lg ${showWebcam ? 'bg-red-500 text-white' : 'bg-primary text-primary-foreground'}`}
          >
            {showWebcam ? 'End Interview' : 'Begin Interview Practice'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-secondary rounded-2xl p-6">
            <div className="aspect-video bg-background rounded-lg relative overflow-hidden">
              {showWebcam ? (
                <Webcam
                  ref={webcamRef}
                  audio={true}
                  mirrored={true}
                  videoConstraints={videoConstraints}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Camera className="h-12 w-12 mx-auto mb-4" />
                    <p>Click "Begin Interview Practice" to start</p>
                  </div>
                </div>
              )}
              
              {showWebcam && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-background/80 backdrop-blur-sm p-3 rounded-full">
                  <button
                    onClick={toggleRecording}
                    className={`p-3 rounded-full ${
                      isRecording ? 'bg-red-500 text-white' : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    <Video className="h-5 w-5" />
                  </button>
                  <button className="p-3 rounded-full bg-primary text-primary-foreground">
                    <Mic className="h-5 w-5" />
                  </button>
                  <button className="p-3 rounded-full bg-accent">
                    <Volume2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setShowTranscript(!showTranscript)}
                    className={`p-3 rounded-full ${
                      showTranscript ? 'bg-primary text-primary-foreground' : 'bg-accent'
                    }`}
                  >
                    <Languages className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => setShowSettings(true)}
                    className="p-3 rounded-full bg-accent"
                  >
                    <Settings className="h-5 w-5" />
                  </button>
                </div>
              )}

              {currentQuestion && showWebcam && (
                <div className="absolute top-6 right-6 px-4 py-2 rounded-full bg-background/80 backdrop-blur-sm text-sm">
                  Question {questionNumber}/10
                </div>
              )}
            </div>
          </div>

          <div className="bg-secondary rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">Current Question</h2>
            {currentQuestion ? (
              <>
                <p className="text-muted-foreground mb-6">{currentQuestion.text}</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary">
                      {currentQuestion.category}
                    </span>
                    <span>Question {questionNumber}/10</span>
                  </div>
                  <button 
                    onClick={handleNextQuestion}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg"
                  >
                    Next Question
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">
                Start a new interview session to begin practicing
              </p>
            )}
            
            {showTranscript && transcript && (
              <div className="space-y-4 mt-6">
                <h3 className="font-medium flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Live Transcription
                </h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>{transcript}</p>
                </div>
              </div>
            )}
          </div>

          <DocumentAnalysis onQuestionsGenerated={handleQuestionsGenerated} />
        </div>

        <div className="space-y-6">
          <div className="bg-secondary rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-6">Real-time Analysis</h2>
            <div className="space-y-6">
              {Object.entries(metrics).map(([key, value]) => (
                <div key={key}>
                  <div className="flex justify-between items-center mb-2">
                    <span>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="text-primary">{Math.round(value)}%</span>
                  </div>
                  <div className="h-2 bg-accent rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-secondary rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">AI Feedback</h2>
              <button
                onClick={() => setShowChat(true)}
                className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <MessageSquare className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              {feedback.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Brain className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <p className="font-medium">{item}</p>
                  </div>
                </div>
              ))}
              {feedback.length === 0 && (
                <p className="text-muted-foreground">
                  Start recording to receive AI feedback
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {showSettings && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-background border border-secondary rounded-2xl p-8 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Interview Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Interview Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Brain className="h-5 w-5" />
                      <span>Interview Type</span>
                    </div>
                    <select 
                      className="bg-secondary rounded-lg px-3 py-2"
                      value={interviewType}
                      onChange={(e) => setInterviewType(e.target.value)}
                    >
                      <option value="technical">Technical</option>
                      <option value="behavioral">Behavioral</option>
                      <option value="general">General</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Sliders className="h-5 w-5" />
                      <span>Difficulty Level</span>
                    </div>
                    <select 
                      className="bg-secondary rounded-lg px-3 py-2"
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Video Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Camera className="h-5 w-5" />
                      <span>Camera</span>
                    </div>
                    <select className="bg-secondary rounded-lg px-3 py-2">
                      <option>Webcam HD</option>
                      <option>External Camera</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Maximize2 className="h-5 w-5" />
                      <span>Resolution</span>
                    </div>
                    <select className="bg-secondary rounded-lg px-3 py-2">
                      <option>1080p</option>
                      <option>720p</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Audio Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mic className="h-5 w-5" />
                      <span>Microphone</span>
                    </div>
                    <select className="bg-secondary rounded-lg px-3 py-2">
                      <option>Built-in Mic</option>
                      <option>External Mic</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <VolumeX className="h-5 w-5" />
                      <span>Noise Cancellation</span>
                    </div>
                    <div className="w-11 h-6 bg-accent rounded-full relative cursor-pointer">
                      <div className="absolute left-0 w-6 h-6 bg-primary rounded-full transform translate-x-5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 rounded-lg bg-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {showChat && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-background border border-secondary rounded-2xl p-6 w-full max-w-xl h-[600px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">AI Interview Assistant</h2>
              <button
                onClick={() => setShowChat(false)}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {chatHistory.map((chat, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${
                    chat.role === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${
                      chat.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary'
                    }`}
                  >
                    {chat.message}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask for interview advice..."
                className="flex-1 px-4 py-2 rounded-lg bg-secondary"
              />
              <button
                onClick={sendMessage}
                className="p-2 rounded-lg bg-primary text-primary-foreground"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {showQuestionsModal && (
        <QuestionModal
          questions={customQuestions}
          onClose={() => setShowQuestionsModal(false)}
          onSelectQuestion={handleQuestionSelect}
        />
      )}
    </div>
  );
}

export default VideoBot;