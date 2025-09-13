import { Video, Mic, Volume2, Languages, Settings } from 'lucide-react';

interface InterviewControlsProps {
  isRecording: boolean;
  showTranscript: boolean;
  onToggleRecording: () => void;
  onToggleTranscript: () => void;
  onOpenSettings: () => void;
}

function InterviewControls({
  isRecording,
  showTranscript,
  onToggleRecording,
  onToggleTranscript,
  onOpenSettings,
}: InterviewControlsProps) {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-background/80 backdrop-blur-sm p-3 rounded-full">
      <button
        onClick={onToggleRecording}
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
        onClick={onToggleTranscript}
        className={`p-3 rounded-full ${
          showTranscript ? 'bg-primary text-primary-foreground' : 'bg-accent'
        }`}
      >
        <Languages className="h-5 w-5" />
      </button>
      <button 
        onClick={onOpenSettings}
        className="p-3 rounded-full bg-accent"
      >
        <Settings className="h-5 w-5" />
      </button>
    </div>
  );
}

export default InterviewControls;