import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import * as pdfParse from 'npm:pdf-parse@1.1.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      throw new Error('No file provided');
    }

    const fileContent = await file.arrayBuffer();
    let text = '';

    if (file.type === 'application/pdf') {
      const pdfData = await pdfParse(new Uint8Array(fileContent));
      text = pdfData.text;
    } else if (file.type === 'application/json') {
      text = new TextDecoder().decode(fileContent);
    } else {
      text = new TextDecoder().decode(fileContent);
    }

    // Extract key information
    const skills = extractSkills(text);
    const experience = extractExperience(text);
    const education = extractEducation(text);

    // Generate customized questions
    const questions = generateQuestions(skills, experience, education);

    return new Response(
      JSON.stringify({ questions }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});

function extractSkills(text: string): string[] {
  // Simple keyword extraction for skills
  const commonSkills = [
    'javascript', 'python', 'java', 'react', 'node', 'aws',
    'docker', 'kubernetes', 'sql', 'nosql', 'mongodb',
    'machine learning', 'ai', 'devops', 'cloud', 'agile'
  ];

  return commonSkills.filter(skill => 
    text.toLowerCase().includes(skill.toLowerCase())
  );
}

function extractExperience(text: string): string[] {
  // Basic experience extraction
  const lines = text.split('\n');
  return lines.filter(line => 
    line.match(/\b(20\d{2}|19\d{2})\b/) && // Has a year
    line.length > 30 // Reasonable length for experience
  );
}

function extractEducation(text: string): string[] {
  // Basic education extraction
  const educationKeywords = ['bachelor', 'master', 'phd', 'degree', 'university'];
  const lines = text.split('\n');
  return lines.filter(line =>
    educationKeywords.some(keyword => 
      line.toLowerCase().includes(keyword)
    )
  );
}

function generateQuestions(
  skills: string[],
  experience: string[],
  education: string[]
): string[] {
  const questions = [];

  // Technical questions based on skills
  skills.forEach(skill => {
    questions.push(
      `Can you describe a challenging project where you used ${skill}?`,
      `What's your experience level with ${skill} and how have you applied it in your work?`
    );
  });

  // Experience-based questions
  if (experience.length > 0) {
    questions.push(
      'What was the most challenging project you worked on and how did you overcome the obstacles?',
      'Can you describe a situation where you had to learn a new technology quickly?',
      'How do you handle conflicts in a team environment?'
    );
  }

  // Education-related questions
  if (education.length > 0) {
    questions.push(
      'How has your educational background prepared you for this role?',
      'What relevant coursework or projects have you completed that align with this position?'
    );
  }

  // General questions
  questions.push(
    'Where do you see yourself in 5 years?',
    'What interests you most about this role?',
    'How do you stay updated with industry trends and new technologies?'
  );

  return questions;
}