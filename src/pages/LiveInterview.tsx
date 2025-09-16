import React, { useEffect, useRef, useState } from 'react';
import { InterviewAnalysis } from '../components/InterviewAnalysis';
import { uploadRecording } from '../services/api';

const LiveInterview: React.FC = () => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const [recording, setRecording] = useState(false);
  const [saving, setSaving] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      stream?.getTracks().forEach(t => t.stop());
    };
  }, [stream]);

  const startRecording = async () => {
    const localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    setStream(localStream);
    if (videoRef.current) {
      videoRef.current.srcObject = localStream;
      await (videoRef.current as HTMLVideoElement).play().catch(() => {});
    }
    const mr = new MediaRecorder(localStream, { mimeType: 'video/webm;codecs=vp9,opus' });
    chunksRef.current = [];
    mr.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };
    mr.onstop = async () => {
      try {
        setSaving(true);
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        await uploadRecording(blob);
      } catch (e) {
        console.error(e);
      } finally {
        setSaving(false);
      }
    };
    mediaRecorderRef.current = mr;
    mr.start();
    setRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      setRecording(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 text-gray-100">
      <h1 className="text-3xl font-bold mb-6">Live Interview</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-900/60 border border-gray-700 rounded-2xl p-4">
          <div className="aspect-video bg-black/50 rounded-lg overflow-hidden flex items-center justify-center">
            <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
          </div>
          <div className="mt-4 flex gap-3">
            {!recording ? (
              <button onClick={startRecording} className="px-4 py-2 rounded-lg bg-emerald-600 text-white">Start Recording</button>
            ) : (
              <button onClick={stopRecording} className="px-4 py-2 rounded-lg bg-red-600 text-white">Stop & Save</button>
            )}
            {saving && <span className="text-gray-300">Uploading...</span>}
          </div>
          <div className="mt-4">
            <label className="block text-sm text-gray-300 mb-2">Or upload an existing recording</label>
            <input
              type="file"
              accept="video/*,audio/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setSaving(true);
                try {
                  await uploadRecording(file, file.name);
                } finally {
                  setSaving(false);
                  e.currentTarget.value = '';
                }
              }}
              className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
            />
          </div>
        </div>
        <div className="bg-gray-900/60 border border-gray-700 rounded-2xl p-4">
          <h2 className="text-xl font-semibold mb-3">Real-time Analysis</h2>
          <InterviewAnalysis />
        </div>
      </div>
    </div>
  );
};

export default LiveInterview; 