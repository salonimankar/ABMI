import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './pages/Dashboard';
import LiveInterview from './pages/LiveInterview';
import AnalysisReport from './pages/AnalysisReport';
import PastRecordings from './pages/PastRecordings';
import Profile from './pages/Profile';
import Login from './pages/Login';
import VideoBot from './pages/VideoBot';
import Analysis from './pages/Analysis';
import CustomModes from './pages/CustomModes';
import Settings from './pages/Settings';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      
      {/* Protected routes */}
      <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="interview" element={<LiveInterview />} />
        <Route path="analysis" element={<Analysis />} />
        <Route path="analysis/:id" element={<AnalysisReport />} />
        <Route path="recordings" element={<PastRecordings />} />
        <Route path="profile" element={<Profile />} />
        <Route path="video-bot" element={<VideoBot />} />
        <Route path="custom-modes" element={<CustomModes />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
} 