interface MetricsProps {
  metrics: {
    confidence: number;
    clarity: number;
    eyeContact: number;
    engagement: number;
    speechRate: number;
    responseQuality: number;
    answerStructure: number;
  };
}

function InterviewMetrics({ metrics }: MetricsProps) {
  return (
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
  );
}

export default InterviewMetrics;