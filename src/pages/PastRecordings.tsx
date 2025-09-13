import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Calendar, Clock, BarChart2 } from 'lucide-react';

interface Recording {
  id: string;
  date: string;
  duration: string;
  score: number;
  thumbnail: string;
}

const mockRecordings: Recording[] = [
  {
    id: '1',
    date: '2024-03-15',
    duration: '15:30',
    score: 85,
    thumbnail: 'https://placehold.co/320x180',
  },
  {
    id: '2',
    date: '2024-03-14',
    duration: '12:45',
    score: 78,
    thumbnail: 'https://placehold.co/320x180',
  },
  {
    id: '3',
    date: '2024-03-13',
    duration: '18:20',
    score: 92,
    thumbnail: 'https://placehold.co/320x180',
  },
  {
    id: '4',
    date: '2024-03-12',
    duration: '14:15',
    score: 81,
    thumbnail: 'https://placehold.co/320x180',
  },
];

export default function PastRecordings() {
  const [selectedRecording, setSelectedRecording] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Past Recordings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockRecordings.map((recording) => (
          <div
            key={recording.id}
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            <div className="relative aspect-video">
              <img
                src={recording.thumbnail}
                alt={`Recording from ${recording.date}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Link
                  to={`/analysis/${recording.id}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <Play className="h-4 w-4 mr-2" />
                  View Analysis
                </Link>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span className="text-sm">{recording.date}</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="text-sm">{recording.duration}</span>
                </div>
              </div>
              <div className="flex items-center">
                <BarChart2 className="h-4 w-4 text-indigo-600 mr-1" />
                <span className="text-sm font-medium text-gray-900">
                  Score: {recording.score}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 