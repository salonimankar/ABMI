import { z } from 'zod';

export const questionSchema = z.object({
  id: z.string().uuid(),
  text: z.string().min(10),
  category: z.enum(['technical', 'behavioral', 'general']),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  expectedDuration: z.number().min(30).max(300), // in seconds
  rubric: z.array(z.object({
    criterion: z.string(),
    weight: z.number().min(1).max(100),
  })),
  sampleAnswer: z.string(),
  tags: z.array(z.string()),
});

export type Question = z.infer<typeof questionSchema>;

// Sample questions database
export const questions: Question[] = [
  {
    id: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
    text: 'Tell me about a challenging project you\'ve worked on and how you handled obstacles that came up during its implementation.',
    category: 'behavioral',
    difficulty: 'intermediate',
    expectedDuration: 180,
    rubric: [
      { criterion: 'Problem description clarity', weight: 20 },
      { criterion: 'Solution approach', weight: 30 },
      { criterion: 'Results and impact', weight: 30 },
      { criterion: 'Learning demonstration', weight: 20 },
    ],
    sampleAnswer: 'A good answer should follow the STAR method...',
    tags: ['problem-solving', 'project-management', 'teamwork'],
  },
  {
    id: '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q',
    text: 'Explain how React\'s virtual DOM works and its benefits.',
    category: 'technical',
    difficulty: 'intermediate',
    expectedDuration: 120,
    rubric: [
      { criterion: 'Technical accuracy', weight: 40 },
      { criterion: 'Explanation clarity', weight: 30 },
      { criterion: 'Real-world examples', weight: 30 },
    ],
    sampleAnswer: 'The Virtual DOM is a lightweight copy of the actual DOM...',
    tags: ['react', 'javascript', 'web-development'],
  },
  // Add more questions as needed
];

export function getQuestionsByType(category: Question['category'], difficulty: Question['difficulty']): Question[] {
  return questions.filter(q => q.category === category && q.difficulty === difficulty);
}

export function getRandomQuestion(category: Question['category'], difficulty: Question['difficulty']): Question {
  const filteredQuestions = getQuestionsByType(category, difficulty);
  return filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)];
}