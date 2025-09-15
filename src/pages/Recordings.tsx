import React, { useEffect, useMemo, useState } from 'react';
import { Play, Download, Trash2, Upload, Loader2, AlertCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  listRecordings,
  getRecordingUrl,
  getRecordingDownloadUrl,
  deleteRecording as apiDeleteRecording,
  uploadRecording as apiUploadRecording,
} from '../services/api';

interface RecordingItem {
  id: string;
  name: string;
  path: string;
  created_at: string | Date;
}

function Recordings() {
  const [items, setItems] = useState<RecordingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listRecordings();
      const list: RecordingItem[] = (res?.items || []).map((it: any) => ({
        id: it.id || it.name,
        name: it.name || it.id,
        path: it.path,
        created_at: it.created_at,
      }));
      setItems(list);
    } catch (e: any) {
      console.error('[recordings] fetch failed, using mock', e?.message);
      // Mock fallback
      const mock: RecordingItem[] = [
        { id: 'mock1.webm', name: 'mock1.webm', path: 'recordings/mock1.webm', created_at: new Date().toISOString() },
      ];
      setItems(mock);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filtered = useMemo(() => {
    return items.filter((it) => it.name.toLowerCase().includes(filter.toLowerCase()))
      .sort((a, b) => new Date(String(b.created_at)).getTime() - new Date(String(a.created_at)).getTime());
  }, [items, filter]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this recording?')) return;
    try {
      await apiDeleteRecording(id);
      toast.success('Recording deleted');
      fetchItems();
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete recording');
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await apiUploadRecording(file, file.name);
      toast.success('Recording uploaded');
      fetchItems();
    } catch (e) {
      console.error(e);
      toast.error('Failed to upload');
    } finally {
      setUploading(false);
      e.currentTarget.value = '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-indigo-300">
        <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading recordings...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex items-center gap-2 text-red-400">
          <AlertCircle className="h-6 w-6" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Recorded Interviews</h1>
          <p className="text-gray-400 mt-1">Play, download, delete or upload new recordings</p>
        </div>
        <label className="inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-indigo-600 text-white cursor-pointer">
          <Upload className="h-4 w-4" />
          <span>{uploading ? 'Uploading...' : 'Upload recording'}</span>
          <input type="file" accept="video/*,audio/*" onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Search recordings..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg bg-gray-900/60 border border-gray-700 text-gray-100 placeholder-gray-400"
        />
      </div>

      <div className="bg-gray-900/60 border border-gray-700 rounded-2xl p-6">
        <div className="space-y-4">
          {filtered.map((rec) => {
            const url = getRecordingUrl(rec.id);
            const downloadUrl = getRecordingDownloadUrl(rec.id);
            const isActive = activePlayerId === rec.id;
            const isVideo = rec.name.match(/\.(webm|mp4|mov|mkv)$/i);
            return (
              <div key={rec.id} className="bg-gray-950/60 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-600/20 flex items-center justify-center">
                      <Play className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div>
                      <p className="font-medium">{rec.name}</p>
                      <p className="text-xs text-gray-400">{new Date(String(rec.created_at)).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={downloadUrl} className="px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700" download>
                      <Download className="h-4 w-4" />
                    </a>
                    <button onClick={() => handleDelete(rec.id)} className="px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-red-400">
                      <Trash2 className="h-4 w-4" />
                    </button>
                    {!isActive ? (
                      <button onClick={() => setActivePlayerId(rec.id)} className="px-3 py-2 rounded-lg bg-indigo-600 text-white">Play</button>
                    ) : (
                      <button onClick={() => setActivePlayerId(null)} className="px-3 py-2 rounded-lg bg-gray-800 text-gray-200"><X className="h-4 w-4" /></button>
                    )}
                  </div>
                </div>
                {isActive && (
                  <div className="mt-4">
                    {isVideo ? (
                      <video src={url} controls className="w-full rounded-lg border border-gray-800" />
                    ) : (
                      <audio src={url} controls className="w-full" />
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-8 text-gray-400">No recordings found</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Recordings;