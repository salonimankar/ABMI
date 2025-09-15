import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  ClockIcon,
  StarIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

interface InterviewStats {
  totalInterviews: number;
  averageScore: number;
  totalDuration: number;
  completedInterviews: number;
}

// Sample data for the chart
const sampleWeeklyProgress = [
  { date: 'Mon', score: 75 },
  { date: 'Tue', score: 82 },
  { date: 'Wed', score: 78 },
  { date: 'Thu', score: 85 },
  { date: 'Fri', score: 80 },
  { date: 'Sat', score: 88 },
  { date: 'Sun', score: 90 },
];

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statsState, setStatsState] = useState<InterviewStats>({
    totalInterviews: 0,
    averageScore: 0,
    totalDuration: 0,
    completedInterviews: 0,
  });

  useEffect(() => {
    // TODO: Fetch actual stats from the backend
    setStatsState({
      totalInterviews: 12,
      averageScore: 85,
      totalDuration: 180,
      completedInterviews: 8,
    });
  }, []);

  const statsItems = [
    {
      name: 'Total Interviews',
      value: statsState.totalInterviews,
      icon: ChartBarIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Average Score',
      value: `${statsState.averageScore}%`,
      icon: StarIcon,
      color: 'bg-yellow-500',
    },
    {
      name: 'Total Duration',
      value: `${statsState.totalDuration} min`,
      icon: ClockIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Completed',
      value: statsState.completedInterviews,
      icon: UserGroupIcon,
      color: 'bg-purple-500',
    },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const handleStartInterview = () => {
    navigate('/interview');
  };

  const handleViewAnalysis = () => {
    navigate('/analysis');
  };

  const handleViewRecordings = () => {
    navigate('/recordings');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="text-red-500 text-center">
            <p className="text-lg font-semibold">Error loading dashboard</p>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-gray-100">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-100 mb-8">Welcome back, {user?.email?.split('@')[0]}</h1>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {statsItems.map((item) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900/60 border border-gray-700 p-6 rounded-2xl shadow-xl transform transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <item.icon
                      className={`h-6 w-6 ${item.color} text-white rounded-md p-1`}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-300 truncate">
                        {item.name}
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-100">
                          {item.value}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-900/60 border border-gray-700 p-6 rounded-2xl shadow-xl transform transition-all duration-300 hover:scale-[1.02]">
              <h2 className="text-xl font-bold text-gray-100 mb-4">Quick Actions</h2>
              <div className="space-y-4">
                <button
                  onClick={handleStartInterview}
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-[1.02]"
                >
                  Start New Interview
                </button>
                <button
                  onClick={handleViewAnalysis}
                  className="w-full bg-transparent text-indigo-400 py-3 px-4 rounded-md border border-indigo-600 hover:bg-indigo-950/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-[1.02]"
                >
                  View Analysis
                </button>
                <button
                  onClick={handleViewRecordings}
                  className="w-full bg-transparent text-indigo-400 py-3 px-4 rounded-md border border-indigo-600 hover:bg-indigo-950/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-[1.02]"
                >
                  View Recordings
                </button>
              </div>
            </div>

            <div className="bg-gray-900/60 border border-gray-700 p-6 rounded-2xl shadow-xl transform transition-all duration-300 hover:scale-[1.02]">
              <h2 className="text-xl font-bold text-gray-100 mb-4">Weekly Progress</h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sampleWeeklyProgress}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#E5E7EB' }} />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#4F46E5"
                      fill="#818CF8"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}