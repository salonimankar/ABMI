import React, { useState } from 'react';
import { toast } from 'sonner';
import { uploadResume as apiUploadResume, analyzeResumeAndGithub } from '../services/api';

export default function Resume() {
  const [uploading, setUploading] = useState(false);
  const [resumePath, setResumePath] = useState<string | null>(null);
  const [githubUrl, setGithubUrl] = useState('');
  const [questions, setQuestions] = useState<string[]>([]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      const data = await apiUploadResume(file);
      setResumePath(data.path);
      toast.success('Resume uploaded');
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload resume');
    } finally {
      setUploading(false);
      e.currentTarget.value = '';
    }
  };

  const handleAnalyze = async () => {
    try {
      if (!resumePath || !githubUrl) {
        toast.error('Upload resume and enter GitHub URL');
        return;
      }
      const res = await analyzeResumeAndGithub(resumePath, githubUrl);
      setQuestions(res.questions || []);
      toast.success('Generated questions');
    } catch (err) {
      console.error(err);
      toast.error('Failed to analyze');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-100">Resume & GitHub</h1>
        <p className="text-gray-300 mt-2">Upload your latest resume and add your GitHub profile.</p>
      </div>

      <div className="bg-gray-900/60 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-gray-100 mb-4">Upload Resume (PDF)</h2>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleUpload}
          disabled={uploading}
          className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
        />
        {resumePath && (
          <p className="mt-3 text-sm text-gray-300">
            Uploaded: <code className="text-indigo-300">{resumePath}</code>
          </p>
        )}
      </div>

      <div className="bg-gray-900/60 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-gray-100 mb-4">GitHub Profile</h2>
        <div className="flex gap-3">
          <input
            type="url"
            placeholder="https://github.com/username"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-400"
          />
          <button
            onClick={handleAnalyze}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white disabled:opacity-50"
          >
            Generate Questions
          </button>
        </div>
      </div>

      {questions.length > 0 && (
        <div className="bg-gray-900/60 border border-gray-700 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Personalized Questions</h2>
          <ol className="list-decimal ml-6 space-y-2 text-gray-200">
            {questions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}



