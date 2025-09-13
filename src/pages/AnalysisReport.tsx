import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { Download, Share2 } from 'lucide-react';

const mockTimelineData = [
  { time: '0:00', posture: 85, emotion: 90, tone: 88 },
  { time: '1:00', posture: 82, emotion: 85, tone: 90 },
  { time: '2:00', posture: 88, emotion: 92, tone: 85 },
  { time: '3:00', posture: 90, emotion: 88, tone: 92 },
  { time: '4:00', posture: 85, emotion: 90, tone: 88 },
];

const mockRadarData = [
  { subject: 'Posture', A: 85 },
  { subject: 'Eye Contact', A: 90 },
  { subject: 'Voice Clarity', A: 88 },
  { subject: 'Confidence', A: 92 },
  { subject: 'Body Language', A: 87 },
];

const mockSuggestions = [
  'Maintain consistent eye contact throughout the interview',
  'Work on speaking at a steady pace - you tend to speed up when nervous',
  'Consider using more hand gestures to emphasize key points',
  'Practice maintaining an upright posture for longer periods',
];

export default function AnalysisReport() {
  const { id } = useParams();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    // Simulate export delay
    setTimeout(() => {
      setIsExporting(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Interview Analysis</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export PDF'}
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </button>
        </div>
      </div>

      {/* Overall Score */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Overall Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-indigo-600">85%</div>
            <div className="text-sm text-gray-500">Overall Score</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600">92%</div>
            <div className="text-sm text-gray-500">Best Category</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-600">78%</div>
            <div className="text-sm text-gray-500">Needs Improvement</div>
          </div>
        </div>
      </div>

      {/* Performance Timeline */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Performance Timeline</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockTimelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="posture" stroke="#4F46E5" />
              <Line type="monotone" dataKey="emotion" stroke="#10B981" />
              <Line type="monotone" dataKey="tone" stroke="#F59E0B" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Skills Radar */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Skills Analysis</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={mockRadarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar
                name="Performance"
                dataKey="A"
                stroke="#4F46E5"
                fill="#818CF8"
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Improvement Suggestions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">AI-Powered Suggestions</h2>
        <div className="space-y-4">
          {mockSuggestions.map((suggestion, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-indigo-600" />
              <p className="text-gray-600">{suggestion}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 