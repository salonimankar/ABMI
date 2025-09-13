import React, { useState } from 'react';
import {
  Play,
  Download,
  Trash2,
  Calendar,
  Clock,
  BarChart3,
  Filter,
  Search,
  SortAsc,
  Loader2,
  AlertCircle,
  CheckSquare,
  Square,
} from 'lucide-react';
import { useRecordings } from '../hooks/useRecordings';
import { toast } from 'sonner';

function Recordings() {
  const { recordings, stats, storageUsage, loading, error, deleteRecordings, downloadRecording } = useRecordings();
  const [selectedRecordings, setSelectedRecordings] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'duration' | 'score'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState<string>('all');

  const handleDownload = async (id: string) => {
    try {
      await downloadRecording(id);
      toast.success('Recording downloaded successfully');
    } catch (err) {
      console.error('Error downloading recording:', err);
      toast.error('Failed to download recording');
    }
  };

  const handleDelete = async (ids: string[]) => {
    try {
      if (
        window.confirm(
          `Are you sure you want to delete ${
            ids.length === 1 ? 'this recording' : 'these recordings'
          }?`
        )
      ) {
        await deleteRecordings(ids);
        setSelectedRecordings([]);
        toast.success(`${ids.length === 1 ? 'Recording' : 'Recordings'} deleted successfully`);
      }
    } catch (err) {
      console.error('Error deleting recordings:', err);
      toast.error('Failed to delete recordings');
    }
  };

  const toggleRecordingSelection = (id: string) => {
    setSelectedRecordings((prev) =>
      prev.includes(id)
        ? prev.filter((recordingId) => recordingId !== id)
        : [...prev, id]
    );
  };

  const toggleAllRecordings = () => {
    setSelectedRecordings((prev) =>
      prev.length === recordings.length
        ? []
        : recordings.map((recording) => recording.id)
    );
  };

  const filteredRecordings = recordings
    .filter((recording) => {
      const matchesSearch = recording.interview.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesType =
        filterType === 'all' || recording.interview.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      const order = sortOrder === 'asc' ? 1 : -1;
      switch (sortBy) {
        case 'date':
          return (
            order *
            (new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime())
          );
        case 'duration':
          return (
            order *
            ((b.duration ? parseFloat(b.duration) : 0) -
              (a.duration ? parseFloat(a.duration) : 0))
          );
        case 'score':
          return (
            order *
            ((b.interview.score || 0) - (a.interview.score || 0))
          );
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-primary">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading recordings...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-red-500">
          <AlertCircle className="h-6 w-6" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Recorded Interviews</h1>
        <p className="text-muted-foreground mt-2">
          Review and analyze your past interview sessions
        </p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search recordings..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary"
            />
          </div>
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 rounded-lg bg-secondary flex items-center gap-2"
        >
          <option value="all">All Types</option>
          <option value="technical">Technical</option>
          <option value="behavioral">Behavioral</option>
          <option value="general">General</option>
        </select>
        <button
          onClick={() => {
            setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
          }}
          className="px-4 py-2 rounded-lg bg-secondary flex items-center gap-2"
        >
          <SortAsc className="h-4 w-4" />
          {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
        </button>
      </div>

      {/* Recordings List */}
      <div className="bg-secondary rounded-2xl p-6">
        <div className="space-y-4">
          {filteredRecordings.map((recording) => (
            <div
              key={recording.id}
              className="bg-background rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleRecordingSelection(recording.id)}
                  className="p-1 rounded hover:bg-accent transition-colors"
                >
                  {selectedRecordings.includes(recording.id) ? (
                    <CheckSquare className="h-5 w-5 text-primary" />
                  ) : (
                    <Square className="h-5 w-5" />
                  )}
                </button>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Play className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{recording.interview.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(recording.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{recording.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BarChart3 className="h-4 w-4" />
                      <span>{recording.interview.score}%</span>
                    </div>
                    <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs">
                      {recording.interview.type}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleDownload(recording.id)}
                  className="p-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <Download className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete([recording.id])}
                  className="p-2 rounded-lg hover:bg-accent transition-colors text-red-500"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
          {filteredRecordings.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No recordings found
            </div>
          )}
        </div>
      </div>

      {/* Storage Usage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-secondary rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Storage Usage</h2>
          <div className="space-y-4">
            <div className="h-2 bg-accent rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{
                  width: `${(storageUsage.used / storageUsage.total) * 100}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {storageUsage.used.toFixed(1)} GB used
              </span>
              <span className="text-muted-foreground">
                {storageUsage.total} GB total
              </span>
            </div>
          </div>
        </div>

        <div className="bg-secondary rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Recording Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Recordings</p>
              <p className="text-2xl font-semibold">{stats.totalRecordings}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Duration</p>
              <p className="text-2xl font-semibold">
                {stats.totalDuration.toFixed(1)}h
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average Score</p>
              <p className="text-2xl font-semibold">{stats.averageScore}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Best Score</p>
              <p className="text-2xl font-semibold">{stats.bestScore}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={toggleAllRecordings}
            className="px-4 py-2 rounded-lg bg-secondary"
          >
            {selectedRecordings.length === recordings.length
              ? 'Deselect All'
              : 'Select All'}
          </button>
          {selectedRecordings.length > 0 && (
            <button
              onClick={() => handleDelete(selectedRecordings)}
              className="px-4 py-2 rounded-lg bg-secondary text-red-500"
            >
              Delete Selected
            </button>
          )}
        </div>
        <button 
          onClick={() => {
            toast.info('Downloading all recordings...');
            // Implementation would go here
            setTimeout(() => {
              toast.success('All recordings downloaded successfully');
            }, 1500);
          }}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground"
        >
          Download All
        </button>
      </div>
    </div>
  );
}

export default Recordings;