import React, { useState } from 'react';
import {
  Video,
  Mic,
  Timer,
  ChevronRight,
  Brain,
  MessageSquare,
  Volume2,
  Settings,
  Languages,
} from 'lucide-react';

function Interview() {
  const [isRecording, setIsRecording] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Interview Panel */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-secondary rounded-2xl p-6 aspect-video relative">
          <video
            className="w-full h-full rounded-lg object-cover"
            poster="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1200"
          />
          {showSubtitles && (
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm px-6 py-3 rounded-lg text-center max-w-lg">
              <p>Could you tell me about a challenging project you've worked on and how you handled the obstacles?</p>
            </div>
          )}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-background/80 backdrop-blur-sm p-3 rounded-full">
            <button
              onClick={() => setIsRecording(!isRecording)}
              className={`p-3 rounded-full ${
                isRecording ? 'bg-red-500 text-white' : 'bg-primary text-primary-foreground'
              }`}
            >
              <Video className="h-5 w-5" />
            </button>
            <button className="p-3 rounded-full bg-primary text-primary-foreground">
              <Mic className="h-5 w-5" />
            </button>
            <div className="px-4 py-2 rounded-full bg-primary text-primary-foreground flex items-center">
              <Timer className="h-4 w-4 mr-2" />
              <span>12:30</span>
            </div>
            <button
              onClick={() => setShowSubtitles(!showSubtitles)}
              className={`p-3 rounded-full ${
                showSubtitles ? 'bg-primary text-primary-foreground' : 'bg-accent'
              }`}
            >
              <Languages className="h-5 w-5" />
            </button>
            <button className="p-3 rounded-full bg-accent">
              <Volume2 className="h-5 w-5" />
            </button>
            <button className="p-3 rounded-full bg-accent">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="bg-secondary rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Current Question</h2>
          <p className="text-muted-foreground mb-6">
            "Tell me about a challenging project you've worked on and how you handled obstacles that came up during its implementation."
          </p>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary">
                Behavioral
              </span>
              <span>2/10 Questions</span>
            </div>
            <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg">
              Next Question
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Live Transcription */}
        <div className="bg-secondary rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Live Transcription</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-16 text-sm text-muted-foreground">00:15</div>
              <p>One of the most challenging projects I worked on was...</p>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-16 text-sm text-muted-foreground">00:30</div>
              <p>We faced several technical obstacles, particularly with...</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <div className="bg-secondary rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Real-time Feedback</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Confidence</span>
              <div className="w-32 h-2 bg-accent rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-primary rounded-full" />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span>Clarity</span>
              <div className="w-32 h-2 bg-accent rounded-full overflow-hidden">
                <div className="w-4/5 h-full bg-primary rounded-full" />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span>Eye Contact</span>
              <div className="w-32 h-2 bg-accent rounded-full overflow-hidden">
                <div className="w-2/3 h-full bg-primary rounded-full" />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span>Pace</span>
              <div className="w-32 h-2 bg-accent rounded-full overflow-hidden">
                <div className="w-4/5 h-full bg-primary rounded-full" />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span>Body Language</span>
              <div className="w-32 h-2 bg-accent rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-primary rounded-full" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-secondary rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">AI Assistant</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Brain className="h-6 w-6 text-primary mt-1" />
              <p className="text-sm text-muted-foreground">
                Try to provide more specific examples when discussing your project challenges.
                Quantify your impact where possible.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Brain className="h-6 w-6 text-primary mt-1" />
              <p className="text-sm text-muted-foreground">
                Your speaking pace is good, but consider pausing briefly between main points
                to emphasize key achievements.
              </p>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Ask for interview advice..."
                className="w-full px-4 py-2 rounded-lg bg-background border border-secondary"
              />
              <MessageSquare className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </div>

        <div className="bg-secondary rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Question Guidelines</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>• Use the STAR method (Situation, Task, Action, Result)</p>
            <p>• Include specific metrics and outcomes</p>
            <p>• Focus on your individual contribution</p>
            <p>• Keep responses under 2-3 minutes</p>
            <p>• Address both technical and interpersonal aspects</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Interview;