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
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
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