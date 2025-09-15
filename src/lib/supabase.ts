import { createClient } from '@supabase/supabase-js';
// Use loose typing to avoid 'never' issues if generated types are incomplete
type AnyDatabase = Record<string, unknown>;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Check if we have real environment variables
const hasValidConfig = supabaseUrl !== 'https://placeholder.supabase.co' && supabaseAnonKey !== 'placeholder-key';

if (!hasValidConfig) {
  console.warn('⚠️ Supabase environment variables not configured. Using placeholder values.');
  console.warn('To fix this, create a .env file with:');
  console.warn('VITE_SUPABASE_URL=your_supabase_project_url');
  console.warn('VITE_SUPABASE_ANON_KEY=your_supabase_anon_key');
}

// Create and export the Supabase client with improved configuration
export const supabase = createClient<AnyDatabase>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: localStorage,
    storageKey: 'supabase.auth.token',
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web',
    },
  },
});

// Initialize database tables
export async function initializeDatabase() {
  try {
    // Create profiles table if it doesn't exist
    const { error: profilesError } = await supabase.rpc('create_profiles_table');
    if (profilesError) {
      console.error('Error creating profiles table:', profilesError);
    }

    // Create interviews table if it doesn't exist
    const { error: interviewsError } = await supabase.rpc('create_interviews_table');
    if (interviewsError) {
      console.error('Error creating interviews table:', interviewsError);
    }

    // Create feedback table if it doesn't exist
    const { error: feedbackError } = await supabase.rpc('create_feedback_table');
    if (feedbackError) {
      console.error('Error creating feedback table:', feedbackError);
    }

    // Create recordings table if it doesn't exist
    const { error: recordingsError } = await supabase.rpc('create_recordings_table');
    if (recordingsError) {
      console.error('Error creating recordings table:', recordingsError);
    }

    // Create settings table if it doesn't exist
    const { error: settingsError } = await supabase.rpc('create_settings_table');
    if (settingsError) {
      console.error('Error creating settings table:', settingsError);
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Call initialization when the app starts
initializeDatabase();

// Ensure user profile exists
export async function ensureUserProfile() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting user:', userError);
      return false;
    }

    if (!user) {
      return false;
    }

    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error checking profile:', profileError);
      return false;
    }

    if (!profile) {
      // Create profile if it doesn't exist
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0]
        });

      if (insertError) {
        console.error('Error creating profile:', insertError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error in ensureUserProfile:', error);
    return false;
  }
}

// Initialize auth state
export async function initializeAuth() {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error getting session:', sessionError);
      return null;
    }

    if (session?.user) {
      await ensureUserProfile();
    }

    return session?.user || null;
  } catch (error) {
    console.error('Error initializing auth:', error);
    return null;
  }
}

// Handle auth state changes
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_IN' && session?.user) {
    await ensureUserProfile();
  }
});

// Auth helpers
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Interview helpers
export const saveInterview = async (interview: any) => {
  const { data, error } = await supabase
    .from('interviews')
    .insert(interview)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getInterviews = async (userId: string) => {
  const { data, error } = await supabase
    .from('interviews')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

// Resume helpers
export const uploadResume = async (userId: string, file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('resumes')
    .upload(fileName, file);
  
  if (uploadError) throw uploadError;
  
  const { data: urlData } = supabase.storage
    .from('resumes')
    .getPublicUrl(fileName);
  
  const { data, error } = await supabase
    .from('resumes')
    .insert({
      user_id: userId,
      file_url: urlData.publicUrl,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// User profile helpers
export const updateUserProfile = async (userId: string, updates: any) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

export const getUserSettings = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
};

export const updateUserSettings = async (userId: string, updates: any) => {
  const { data, error } = await supabase
    .from('user_settings')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getInterviewAnalysis = async (interviewId: string) => {
  const { data, error } = await supabase
    .from('interview_analysis')
    .select('*')
    .eq('interview_id', interviewId)
    .single();

  if (error) throw error;
  return data;
};

export const createInterview = async (interview: any) => {
  const { data, error } = await supabase
    .from('interviews')
    .insert(interview)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateInterview = async (interviewId: string, updates: any) => {
  const { data, error } = await supabase
    .from('interviews')
    .update(updates)
    .eq('id', interviewId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const createInterviewAnalysis = async (analysis: any) => {
  const { data, error } = await supabase
    .from('interview_analysis')
    .insert(analysis)
    .select()
    .single();

  if (error) throw error;
  return data;
};