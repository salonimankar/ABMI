import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface ConnectedDevice {
  device: string;
  lastActive: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendPhoneOtp: (phoneE164: string) => Promise<void>;
  verifyPhoneOtp: (phoneE164: string, token: string) => Promise<void>;
  sendEmailOtp: (email: string) => Promise<void>;
  verifyEmailOtp: (email: string, token: string) => Promise<void>;
  resetPasswordEmail: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  getConnectedDevices: () => Promise<ConnectedDevice[]>;
  revokeDevice: (deviceId: string) => Promise<void>;
  enable2FA: () => Promise<{ qrCode: string; secret: string }>;
  verify2FA: (code: string) => Promise<void>;
  disable2FA: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Safety timeout in case Supabase network hangs
    const loadingSafeguard = setTimeout(() => {
      if (loading) {
        console.warn('Auth loading timed out, proceeding without session');
        setLoading(false);
      }
    }, 5000);

    // Check if Supabase is properly configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://placeholder.supabase.co') {
      console.warn('Supabase not configured, using mock authentication');
      setUser(null);
      setLoading(false);
      clearTimeout(loadingSafeguard);
      return;
    }

    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      clearTimeout(loadingSafeguard);
    }).catch((error) => {
      console.error('Error getting session:', error);
      setUser(null);
      setLoading(false);
      clearTimeout(loadingSafeguard);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      clearTimeout(loadingSafeguard);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://placeholder.supabase.co') {
      // Mock authentication for development
      console.warn('Using mock authentication - Supabase not configured');
      setUser({
        id: 'mock-user-id',
        email: email,
        user_metadata: { full_name: email.split('@')[0] },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        app_metadata: {},
        role: 'authenticated'
      } as User);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      if (error.message && error.message.toLowerCase().includes('email not confirmed')) {
        throw new Error('Please verify your email before signing in.');
      }
      throw error;
    }
    if (!data?.user?.email_confirmed_at) {
      await supabase.auth.signOut();
      throw new Error('Please verify your email before signing in.');
    }
  };

  const signUp = async (email: string, password: string) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://placeholder.supabase.co') {
      // Mock authentication for development
      console.warn('Using mock authentication - Supabase not configured');
      setUser({
        id: 'mock-user-id',
        email: email,
        user_metadata: { full_name: email.split('@')[0] },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        app_metadata: {},
        role: 'authenticated'
      } as User);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });
    if (error) throw error;
    if (data?.user) {
      toast.success('Verification link sent. Please check your email.');
    }
  };

  const signOut = async () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://placeholder.supabase.co') {
      // Mock authentication for development
      setUser(null);
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPasswordEmail = async (email: string) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://placeholder.supabase.co') {
      toast.success('If this were configured, a reset email would be sent.');
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    if (error) throw error;
  };

  const sendPhoneOtp = async (phoneE164: string) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://placeholder.supabase.co') {
      console.warn('Using mock OTP - Supabase not configured');
      toast.success('Mock OTP sent to phone');
      return;
    }
    const { error } = await supabase.auth.signInWithOtp({
      phone: phoneE164,
      options: {
        channel: 'sms',
      },
    });
    if (error) throw error;
    toast.success('OTP sent via SMS');
  };

  const verifyPhoneOtp = async (phoneE164: string, token: string) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://placeholder.supabase.co') {
      console.warn('Using mock OTP verify - Supabase not configured');
      setUser({
        id: 'mock-user-id',
        email: null as unknown as string,
        user_metadata: { phone: phoneE164 },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        app_metadata: {},
        role: 'authenticated'
      } as unknown as User);
      toast.success('Mock OTP verified');
      return;
    }
    const { error } = await supabase.auth.verifyOtp({
      phone: phoneE164,
      token,
      type: 'sms',
    });
    if (error) throw error;
    toast.success('Phone verified and signed in');
  };

  const sendEmailOtp = async (email: string) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://placeholder.supabase.co') {
      console.warn('Using mock email OTP - Supabase not configured');
      toast.success('Mock OTP sent to email');
      return;
    }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });
    if (error) throw error;
    toast.success('OTP sent to email');
  };

  const verifyEmailOtp = async (email: string, token: string) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://placeholder.supabase.co') {
      console.warn('Using mock email OTP verify - Supabase not configured');
      setUser({
        id: 'mock-user-id',
        email,
        user_metadata: { full_name: email.split('@')[0] },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        app_metadata: {},
        role: 'authenticated'
      } as User);
      toast.success('Mock email OTP verified');
      return;
    }
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });
    if (error) throw error;
    toast.success('Email verified and signed in');
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
    toast.success('Password updated successfully');
  };

  const getConnectedDevices = async (): Promise<ConnectedDevice[]> => {
    // For now, return a mock list of devices
    return [
      {
        device: 'Chrome on Windows',
        lastActive: new Date().toLocaleString(),
      },
      {
        device: 'Safari on iPhone',
        lastActive: new Date(Date.now() - 86400000).toLocaleString(), // 1 day ago
      },
    ];
  };

  const revokeDevice = async (deviceId: string) => {
    // In a real implementation, this would revoke the session
    toast.success('Device access revoked');
  };

  const enable2FA = async () => {
    // In a real implementation, this would generate a QR code and secret
    return {
      qrCode: 'https://example.com/qr-code.png',
      secret: 'ABCDEFGHIJKLMNOP',
    };
  };

  const verify2FA = async (code: string) => {
    // In a real implementation, this would verify the 2FA code
    toast.success('2FA enabled successfully');
  };

  const disable2FA = async () => {
    // In a real implementation, this would disable 2FA
    toast.success('2FA disabled successfully');
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    sendPhoneOtp,
    verifyPhoneOtp,
    sendEmailOtp,
    verifyEmailOtp,
    resetPasswordEmail,
    updatePassword,
    getConnectedDevices,
    revokeDevice,
    enable2FA,
    verify2FA,
    disable2FA,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 