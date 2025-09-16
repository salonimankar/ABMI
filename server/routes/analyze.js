import { Router } from 'express';
import pdf from 'pdf-parse';
import fs from 'fs';
import fetch from 'node-fetch';

const router = Router();

// Simple skill extraction from resume text
function extractSkills(text) {
  const skills = [];
  const skillKeywords = ['javascript','typescript','react','node','express','python','java','docker','kubernetes','aws','azure','gcp','sql','mongodb','postgres','graphql','tailwind','css','html'];
  for (const kw of skillKeywords) {
    const re = new RegExp(`\\b${kw}\\b`, 'i');
    if (re.test(text)) skills.push(kw);
  }
  return Array.from(new Set(skills));
}

// Generate basic interview questions
function generateQuestions(skills, repos) {
  const questions = [];
  for (const s of skills) {
    questions.push(`Explain a challenging problem you solved using ${s}.`);
    questions.push(`How do you optimize performance in ${s}?`);
  }
  for (const repo of repos.slice(0, 5)) {
    questions.push(`Walk me through the architecture of your project "${repo.name}".`);
    questions.push(`What trade-offs did you make while building "${repo.name}"?`);
  }
  return questions.slice(0, 20);
}

router.post('/resume-github', async (req, res) => {
  try {
    const { resumePath, githubUrl } = req.body;
    if (!resumePath || !githubUrl) return res.status(400).json({ error: 'resumePath and githubUrl required' });

    // Read resume
    const buffer = fs.readFileSync(resumePath);
    const parsed = await pdf(buffer);
    const skills = extractSkills(parsed.text || '');

    // Fetch repos
    const match = githubUrl.match(/github.com\/([^/]+)(?:\/)?/i);
    const username = match ? match[1] : undefined;
    let repos = [];
    if (username) {
      const resp = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`);
      if (resp.ok) {
        const json = await resp.json();
        repos = json.map(r => ({ name: r.name, description: r.description }));
      }
    }

    const questions = generateQuestions(skills, repos);
    res.json({ ok: true, skills, repos, questions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to analyze inputs' });
  }
});

export default router;



