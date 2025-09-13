import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const signupSchema = loginSchema.extend({
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
});

export const settingsSchema = z.object({
  theme: z.enum(['light', 'dark']),
  language: z.enum(['en', 'es', 'fr', 'de', 'ja', 'ko', 'zh']),
  notifications: z.object({
    email: z.boolean(),
    interviewReminders: z.boolean(),
    performanceReports: z.boolean(),
  }),
  video: z.object({
    resolution: z.enum(['720p', '1080p']),
    noiseCancellation: z.boolean(),
  }),
});

export const customModeSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  type: z.enum(['technical', 'behavioral', 'general']),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  settings: z.object({
    eyeTracking: z.boolean(),
    multilingualSupport: z.boolean(),
    timedResponses: z.boolean(),
    realTimeFeedback: z.boolean(),
    aiAssistant: z.boolean(),
    adaptiveDifficulty: z.boolean(),
    videoRecording: z.boolean(),
    audioRecording: z.boolean(),
    transcription: z.boolean(),
  }),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
export type CustomModeInput = z.infer<typeof customModeSchema>;