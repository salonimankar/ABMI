import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as SupabaseUser, AuthError } from '@supabase/supabase-js';
import { supabase, ensureUserProfile, initializeAuth } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AuthContextType {
  user: SupabaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPasswordEmail: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  getConnectedDevices: () => Promise<{ device: string; lastActive: string }[]>;
  revokeDevice: (deviceId: string) => Promise<void>;
  enable2FA: () => Promise<{ qrCode: string; secret: string }>;
  verify2FA: (token: string) => Promise<void>;
  disable2FA: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const setupAuth = async () => {
      try {
        // Get session immediately
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          setUser(session?.user || null);
          setLoading(false);
        }

        // Listen for changes on auth state
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (mounted) {
            setUser(session?.user || null);
            if (!session?.user) {
              navigate('/login', { replace: true });
            }
          }
        });

        return () => {
          mounted = false;
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error setting up auth:', error);
        if (mounted) {
          setLoading(false);
          setUser(null);
        }
      }
    };

    setupAuth();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Please verify your email address before signing in');
        }
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password');
        }
        throw error;
      }
      
      if (!data?.user) {
        throw new Error('No user data received');
      }

      // Navigate immediately after successful sign in
      navigate('/dashboard', { replace: true });
      
      // Show success message
      toast.success('Signed in successfully!');
    } catch (error) {
      const err = error as AuthError;
      toast.error(err.message);
      throw err;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
      toast.success('Account created successfully! Please check your email to verify your account.');
    } catch (error) {
      const err = error as AuthError;
      toast.error(err.message);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      toast.success('Signed out successfully');
      navigate('/login');
    } catch (error) {
      const err = error as AuthError;
      toast.error(err.message);
      throw err;
    }
  };

  const resetPasswordEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success('Password reset instructions sent to your email');
    } catch (error) {
      const err = error as AuthError;
      toast.error(err.message);
      throw err;
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
      toast.success('Password updated successfully');
    } catch (error) {
      const err = error as AuthError;
      toast.error(err.message);
      throw err;
    }
  };

  const getConnectedDevices = async () => {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .order('last_active', { ascending: false });
      
      if (error) throw error;

      return data.map(session => ({
        device: session.user_agent,
        lastActive: new Date(session.last_active).toLocaleString()
      }));
    } catch (error) {
      const err = error as Error;
      toast.error('Failed to fetch connected devices');
      throw err;
    }
  };

  const revokeDevice = async (deviceId: string) => {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('id', deviceId)
        .eq('user_id', user?.id);
      
      if (error) throw error;
      toast.success('Device revoked successfully');
    } catch (error) {
      const err = error as Error;
      toast.error('Failed to revoke device');
      throw err;
    }
  };

  const enable2FA = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.enroll();
      if (error) throw error;
      return {
        qrCode: data.totp_uri,
        secret: data.secret
      };
    } catch (error) {
      const err = error as Error;
      toast.error('Failed to enable 2FA');
      throw err;
    }
  };

  const verify2FA = async (token: string) => {
    try {
      const { error } = await supabase.auth.mfa.challenge({
        factorId: user?.factors?.[0]?.id
      });
      if (error) throw error;
      toast.success('2FA enabled successfully');
    } catch (error) {
      const err = error as Error;
      toast.error('Failed to verify 2FA');
      throw err;
    }
  };

  const disable2FA = async () => {
    try {
      const { error } = await supabase.auth.mfa.unenroll({
        factorId: user?.factors?.[0]?.id
      });
      if (error) throw error;
      toast.success('2FA disabled successfully');
    } catch (error) {
      const err = error as Error;
      toast.error('Failed to disable 2FA');
      throw err;
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPasswordEmail,
    updatePassword,
    getConnectedDevices,
    revokeDevice,
    enable2FA,
    verify2FA,
    disable2FA
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