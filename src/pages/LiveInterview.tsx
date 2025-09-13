import React from 'react';
import { InterviewAnalysis } from '../components/InterviewAnalysis';

const LiveInterview: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Live Interview Analysis</h1>
      <InterviewAnalysis />
    </div>
  );
};

export default LiveInterview; 