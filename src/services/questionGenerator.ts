import { Question } from '../types';

interface QuestionGenerationParams {
  skills: string[];
  experience: {
    company: string;
    position: string;
    duration: string;
    description: string;
  }[];
  projects: {
    name: string;
    description: string;
    technologies: string[];
  }[];
  difficulty: 'easy' | 'medium' | 'hard';
  domain: string;
}

class QuestionGenerator {
  private readonly baseQuestions: Question[] = [
    {
      id: '1',
      text: 'Tell me about yourself and your experience.',
      category: 'general',
      difficulty: 'easy',
      domain: 'general',
      skills: ['communication'],
    },
    {
      id: '2',
      text: 'What are your greatest strengths and weaknesses?',
      category: 'self-assessment',
      difficulty: 'medium',
      domain: 'general',
      skills: ['self-awareness', 'communication'],
    },
    {
      id: '3',
      text: 'Why do you want to work for this company?',
      category: 'motivation',
      difficulty: 'medium',
      domain: 'general',
      skills: ['research', 'communication'],
    },
    // Add more base questions here
  ];

  private readonly domainSpecificQuestions: Record<string, Question[]> = {
    frontend: [
      {
        id: 'f1',
        text: 'Explain the concept of virtual DOM in React.',
        category: 'technical',
        difficulty: 'medium',
        domain: 'frontend',
        skills: ['react', 'javascript'],
      },
      {
        id: 'f2',
        text: 'How do you handle state management in large applications?',
        category: 'technical',
        difficulty: 'hard',
        domain: 'frontend',
        skills: ['state-management', 'architecture'],
      },
    ],
    backend: [
      {
        id: 'b1',
        text: 'Explain the difference between REST and GraphQL.',
        category: 'technical',
        difficulty: 'medium',
        domain: 'backend',
        skills: ['api-design', 'graphql'],
      },
      {
        id: 'b2',
        text: 'How do you handle database scaling?',
        category: 'technical',
        difficulty: 'hard',
        domain: 'backend',
        skills: ['database', 'scaling'],
      },
    ],
    // Add more domain-specific questions
  };

  generateQuestions(params: QuestionGenerationParams): Question[] {
    const questions: Question[] = [];

    // Add base questions
    questions.push(...this.baseQuestions);

    // Add domain-specific questions
    if (params.domain in this.domainSpecificQuestions) {
      questions.push(...this.domainSpecificQuestions[params.domain]);
    }

    // Generate skill-specific questions
    const skillQuestions = this.generateSkillSpecificQuestions(params.skills);
    questions.push(...skillQuestions);

    // Generate experience-based questions
    const experienceQuestions = this.generateExperienceQuestions(params.experience);
    questions.push(...experienceQuestions);

    // Generate project-based questions
    const projectQuestions = this.generateProjectQuestions(params.projects);
    questions.push(...projectQuestions);

    // Filter by difficulty
    const filteredQuestions = questions.filter(q => q.difficulty === params.difficulty);

    // Shuffle and return
    return this.shuffleArray(filteredQuestions);
  }

  private generateSkillSpecificQuestions(skills: string[]): Question[] {
    const questions: Question[] = [];

    skills.forEach(skill => {
      // Add skill-specific questions based on the skill
      // This is a simplified version - you would need to implement the actual logic
      questions.push({
        id: `skill-${skill}`,
        text: `How do you apply ${skill} in your work?`,
        category: 'technical',
        difficulty: 'medium',
        domain: 'general',
        skills: [skill],
      });
    });

    return questions;
  }

  private generateExperienceQuestions(experience: QuestionGenerationParams['experience']): Question[] {
    const questions: Question[] = [];

    experience.forEach(exp => {
      // Add experience-based questions
      // This is a simplified version - you would need to implement the actual logic
      questions.push({
        id: `exp-${exp.company}`,
        text: `Tell me about your experience at ${exp.company} as ${exp.position}.`,
        category: 'experience',
        difficulty: 'medium',
        domain: 'general',
        skills: [],
      });
    });

    return questions;
  }

  private generateProjectQuestions(projects: QuestionGenerationParams['projects']): Question[] {
    const questions: Question[] = [];

    projects.forEach(project => {
      // Add project-based questions
      // This is a simplified version - you would need to implement the actual logic
      questions.push({
        id: `proj-${project.name}`,
        text: `Tell me about your project ${project.name}. What challenges did you face?`,
        category: 'project',
        difficulty: 'medium',
        domain: 'general',
        skills: project.technologies,
      });
    });

    return questions;
  }

  private shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }
}

export const questionGenerator = new QuestionGenerator(); 