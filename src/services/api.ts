export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

// OTP removed: direct email+password auth via existing auth provider

export async function uploadRecording(blob: Blob, filename = 'recording.webm') {
  const form = new FormData();
  form.append('recording', blob, filename);
  const resp = await fetch(`${API_BASE}/uploads/recording`, { method: 'POST', body: form });
  if (!resp.ok) throw new Error('Failed to upload recording');
  return resp.json();
}

export async function uploadResume(file: File) {
  const form = new FormData();
  form.append('resume', file);
  const resp = await fetch(`${API_BASE}/uploads/resume`, { method: 'POST', body: form });
  if (!resp.ok) throw new Error('Failed to upload resume');
  return resp.json();
}

export async function analyzeResumeAndGithub(resumePath: string, githubUrl: string) {
  const resp = await fetch(`${API_BASE}/analyze/resume-github`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resumePath, githubUrl })
  });
  if (!resp.ok) throw new Error('Failed to analyze');
  return resp.json();
}

export async function listRecordings() {
  const resp = await fetch(`${API_BASE}/recordings`);
  if (!resp.ok) throw new Error('Failed to fetch recordings');
  return resp.json();
}

export function getRecordingUrl(id: string) {
  return `${API_BASE}/recordings/${encodeURIComponent(id)}`;
}

export function getRecordingDownloadUrl(id: string) {
  return `${API_BASE}/recordings/${encodeURIComponent(id)}/download`;
}

export async function deleteRecording(id: string) {
  const resp = await fetch(`${API_BASE}/recordings/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!resp.ok) throw new Error('Failed to delete recording');
  return resp.json();
}



