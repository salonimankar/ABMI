export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          bio: string | null
          skills: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          bio?: string | null
          skills?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          bio?: string | null
          skills?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          theme: 'light' | 'dark'
          notification_preferences: {
            email: boolean
            interviewReminders: boolean
            performanceReports: boolean
          }
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          theme?: 'light' | 'dark'
          notification_preferences?: {
            email: boolean
            interviewReminders: boolean
            performanceReports: boolean
          }
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          theme?: 'light' | 'dark'
          notification_preferences?: {
            email: boolean
            interviewReminders: boolean
            performanceReports: boolean
          }
          created_at?: string
          updated_at?: string
        }
      }
      interviews: {
        Row: {
          id: string
          user_id: string
          title: string
          type: 'technical' | 'behavioral' | 'mixed'
          duration: number
          status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          type: 'technical' | 'behavioral' | 'mixed'
          duration: number
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          type?: 'technical' | 'behavioral' | 'mixed'
          duration?: number
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
      interview_analysis: {
        Row: {
          id: string
          interview_id: string
          metrics: {
            confidence: number
            clarity: number
            engagement: number
            responseQuality: number
          }
          feedback: {
            strengths: string[]
            improvements: string[]
          }
          transcript: string
          recording_url: string
          created_at: string
        }
        Insert: {
          id?: string
          interview_id: string
          metrics: {
            confidence: number
            clarity: number
            engagement: number
            responseQuality: number
          }
          feedback: {
            strengths: string[]
            improvements: string[]
          }
          transcript: string
          recording_url: string
          created_at?: string
        }
        Update: {
          id?: string
          interview_id?: string
          metrics?: {
            confidence: number
            clarity: number
            engagement: number
            responseQuality: number
          }
          feedback?: {
            strengths: string[]
            improvements: string[]
          }
          transcript?: string
          recording_url?: string
          created_at?: string
        }
      }
      questions: {
        Row: {
          id: string
          text: string
          type: 'technical' | 'behavioral' | 'mixed'
          difficulty: 'easy' | 'medium' | 'hard'
          category: string
          skills: string[]
          created_at: string
        }
        Insert: {
          id?: string
          text: string
          type: 'technical' | 'behavioral' | 'mixed'
          difficulty: 'easy' | 'medium' | 'hard'
          category: string
          skills: string[]
          created_at?: string
        }
        Update: {
          id?: string
          text?: string
          type?: 'technical' | 'behavioral' | 'mixed'
          difficulty?: 'easy' | 'medium' | 'hard'
          category?: string
          skills?: string[]
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 