import React, { useState, useEffect } from 'react';
import {
  User,
  Bell,
  Shield,
  Volume2,
  Monitor,
  Moon,
  Sun,
  Loader2,
  AlertCircle,
  Save,
  Smartphone,
  Laptop,
  Tablet,
  X,
  QrCode,
  Key,
} from 'lucide-react';
import { supabase, supabaseConfigured } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Switch } from '@headlessui/react';

// Validation schema
const settingsSchema = z.object({
  profile: z.object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  }),
  notifications: z.object({
    email: z.boolean(),
    interviewReminders: z.boolean(),
    performanceReports: z.boolean(),
  }),
  preferences: z.object({
    theme: z.enum(['light', 'dark']),
    language: z.enum(['en', 'es', 'fr', 'de', 'ja', 'ko', 'zh']),
    soundEffects: z.boolean(),
  }),
});

interface ConnectedDevice {
  device: string;
  lastActive: string;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

function Settings() {
  const { user, updatePassword, getConnectedDevices, revokeDevice, enable2FA, verify2FA, disable2FA } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showDevicesModal, setShowDevicesModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>([]);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorQR, setTwoFactorQR] = useState('');
  const [twoFactorSecret, setTwoFactorSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [settings, setSettings] = useState({
    profile: {
      fullName: '',
      email: '',
      bio: '',
    },
    notifications: {
      email: true,
      interviewReminders: true,
      performanceReports: true,
    },
    preferences: {
      theme: 'light' as 'light' | 'dark',
      language: 'en' as 'en',
      soundEffects: true,
    },
    emailNotifications: true,
    interviewReminders: true,
    weeklyReports: true,
    darkMode: false,
    autoSave: true,
  });

  useEffect(() => {
    loadSettings();
    loadSecurityInfo();
  }, [user]);

  const loadSettings = async () => {
    if (!user || !supabaseConfigured) {
      setSettings((prev) => ({
        ...prev,
        profile: {
          fullName: 'John Doe',
          email: user?.email || 'user@example.com',
          bio: 'This is a mock bio. Supabase is not configured.',
        },
        preferences: {
          theme: 'light',
          language: 'en',
          soundEffects: true,
        },
      }));
      document.documentElement.classList.toggle('dark', false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Load profile data
      const { data: profile, error: profileError } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Load settings data
      const { data: userSettings, error: settingsError } = await (supabase as any)
        .from('settings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (settingsError && settingsError.code !== 'PGRST116') {
        throw settingsError;
      }

      setSettings({
        profile: {
          fullName: (profile as any)?.full_name || '',
          email: (profile as any)?.email || '',
          bio: (profile as any)?.bio || '',
        },
        notifications: (userSettings as any)?.notification_preferences || {
          email: true,
          interviewReminders: true,
          performanceReports: true,
        },
        preferences: {
          theme: ((userSettings as any)?.theme as 'light' | 'dark') || 'light',
          language: ((userSettings as any)?.language as 'en') || 'en',
          soundEffects: true,
        },
        emailNotifications: (userSettings as any)?.notification_preferences?.email || true,
        interviewReminders: (userSettings as any)?.notification_preferences?.interviewReminders || true,
        weeklyReports: (userSettings as any)?.notification_preferences?.performanceReports || true,
        darkMode: (userSettings as any)?.theme === 'dark',
        autoSave: true,
      });

      document.documentElement.classList.toggle(
        'dark',
        (userSettings as any)?.theme === 'dark'
      );
    } catch (err) {
      console.error('Error loading settings:', err);
      setError('Failed to load settings');
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const loadSecurityInfo = async () => {
    try {
      if (!user) return;
      const devices = await getConnectedDevices();
      setConnectedDevices(devices);

      if (supabaseConfigured) {
        const { data: mfaData } = await (supabase as any).auth.mfa.getAuthenticatorAssuranceLevel();
        setTwoFactorEnabled(mfaData.currentLevel === 'aal2');
      } else {
        setTwoFactorEnabled(false);
      }
    } catch (err) {
      console.error('Error loading security info:', err);
      toast.error('Failed to load security information');
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await updatePassword(newPassword);
      setShowPasswordModal(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Error updating password:', err);
    }
  };

  const handleDeviceRevoke = async (deviceId: string) => {
    try {
      await revokeDevice(deviceId);
      const updatedDevices = await getConnectedDevices();
      setConnectedDevices(updatedDevices);
    } catch (err) {
      console.error('Error revoking device:', err);
    }
  };

  const handle2FASetup = async () => {
    try {
      const { qrCode, secret } = await enable2FA();
      setTwoFactorQR(qrCode);
      setTwoFactorSecret(secret);
      setShow2FAModal(true);
    } catch (err) {
      console.error('Error setting up 2FA:', err);
    }
  };

  const handleVerify2FA = async () => {
    try {
      await verify2FA(verificationCode);
      setTwoFactorEnabled(true);
      setShow2FAModal(false);
      setVerificationCode('');
    } catch (err) {
      console.error('Error verifying 2FA:', err);
    }
  };

  const handleDisable2FA = async () => {
    try {
      await disable2FA();
      setTwoFactorEnabled(false);
    } catch (err) {
      console.error('Error disabling 2FA:', err);
    }
  };

  const saveSettings = async () => {
    if (!user) {
      toast.error('You must be logged in to save settings');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Validate settings
      const validatedSettings = settingsSchema.parse(settings);

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: validatedSettings.profile.fullName,
          email: validatedSettings.profile.email,
          bio: validatedSettings.profile.bio,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update settings
      const { error: settingsError } = await supabase
        .from('settings')
        .upsert({
          user_id: user.id,
          theme: validatedSettings.preferences.theme,
          language: validatedSettings.preferences.language,
          notification_preferences: validatedSettings.notifications,
          video_settings: {
            resolution: '1080p',
            noise_cancellation: true,
          },
          updated_at: new Date().toISOString(),
        });

      if (settingsError) throw settingsError;

      // Apply theme
      document.documentElement.classList.toggle(
        'dark',
        validatedSettings.preferences.theme === 'dark'
      );

      toast.success('Settings saved successfully');
    } catch (err) {
      console.error('Error saving settings:', err);
      if (err instanceof z.ZodError) {
        setError('Invalid settings data');
        toast.error('Please check your settings data');
      } else {
        setError('Failed to save settings');
        toast.error('Failed to save settings');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleThemeChange = (theme: 'light' | 'dark') => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        theme,
      },
    }));
    document.documentElement.classList.toggle('dark', theme === 'dark');
  };

  const handleToggle = (setting: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
    toast.success('Settings updated');
  };

  const settingsItems = [
    {
      name: 'Email Notifications',
      description: 'Receive email notifications for important updates',
      setting: 'emailNotifications',
    },
    {
      name: 'Interview Reminders',
      description: 'Get reminders before scheduled interviews',
      setting: 'interviewReminders',
    },
    {
      name: 'Weekly Reports',
      description: 'Receive weekly progress reports',
      setting: 'weeklyReports',
    },
    {
      name: 'Dark Mode',
      description: 'Enable dark mode for the application',
      setting: 'darkMode',
    },
    {
      name: 'Auto Save',
      description: 'Automatically save interview progress',
      setting: 'autoSave',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-primary">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading settings...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-red-500">
          <AlertCircle className="h-6 w-6" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings and preferences
          </p>
        </div>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground flex items-center gap-2 disabled:opacity-50"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          <Save className="h-4 w-4" />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <div className="bg-secondary rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Settings
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                value={settings.profile.fullName}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    profile: { ...settings.profile, fullName: e.target.value },
                  })
                }
                className="w-full px-4 py-2 rounded-lg bg-background border border-accent"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={settings.profile.email}
                disabled
                className="w-full px-4 py-2 rounded-lg bg-background border border-accent opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bio</label>
              <textarea
                value={settings.profile.bio}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    profile: { ...settings.profile, bio: e.target.value },
                  })
                }
                className="w-full px-4 py-2 rounded-lg bg-background border border-accent"
                rows={3}
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-secondary rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </h2>
          <div className="space-y-4">
            {Object.entries(settings.notifications).map(([key, value]) => (
              <label
                key={key}
                className="flex items-center justify-between"
              >
                <span>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <button
                  onClick={() =>
                    setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        [key]: !value,
                      },
                    })
                  }
                  className={`w-11 h-6 rounded-full relative ${
                    value ? 'bg-primary' : 'bg-accent'
                  }`}
                >
                  <div
                    className={`absolute w-5 h-5 rounded-full bg-white transform transition-transform ${
                      value ? 'translate-x-5' : 'translate-x-0.5'
                    } top-0.5`}
                  />
                </button>
              </label>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="bg-secondary rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </h2>
          <div className="space-y-4">
            <button 
              onClick={() => setShowPasswordModal(true)}
              className="w-full px-4 py-2 text-left bg-background rounded-lg hover:bg-accent transition-colors flex items-center justify-between"
            >
              <span>Change Password</span>
              <Key className="h-4 w-4" />
            </button>
            <button 
              onClick={() => twoFactorEnabled ? handleDisable2FA() : handle2FASetup()}
              className="w-full px-4 py-2 text-left bg-background rounded-lg hover:bg-accent transition-colors flex items-center justify-between"
            >
              <span>Two-Factor Authentication</span>
              <div className="flex items-center gap-2">
                <span className={twoFactorEnabled ? 'text-green-500' : 'text-muted-foreground'}>
                  {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </span>
                <QrCode className="h-4 w-4" />
              </div>
            </button>
            <button 
              onClick={() => setShowDevicesModal(true)}
              className="w-full px-4 py-2 text-left bg-background rounded-lg hover:bg-accent transition-colors flex items-center justify-between"
            >
              <span>Connected Devices</span>
              <Monitor className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-secondary rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Preferences
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {settings.preferences.theme === 'dark' ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
                <span>Theme</span>
              </div>
              <select
                value={settings.preferences.theme}
                onChange={(e) =>
                  handleThemeChange(e.target.value as 'light' | 'dark')
                }
                className="bg-background border border-accent rounded-lg px-3 py-1"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                <span>Sound Effects</span>
              </div>
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    preferences: {
                      ...settings.preferences,
                      soundEffects: !settings.preferences.soundEffects,
                    },
                  })
                }
                className={`w-11 h-6 rounded-full relative ${
                  settings.preferences.soundEffects
                    ? 'bg-primary'
                    : 'bg-accent'
                }`}
              >
                <div
                  className={`absolute w-5 h-5 rounded-full bg-white transform transition-transform ${
                    settings.preferences.soundEffects
                      ? 'translate-x-5'
                      : 'translate-x-0.5'
                  } top-0.5`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-background border border-secondary rounded-2xl p-8 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Change Password</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-secondary"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-secondary"
                  placeholder="Confirm new password"
                />
              </div>
              <button
                onClick={handlePasswordChange}
                className="w-full bg-primary text-primary-foreground py-2 rounded-lg"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2FA Setup Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-background border border-secondary rounded-2xl p-8 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Set Up Two-Factor Authentication</h3>
              <button
                onClick={() => setShow2FAModal(false)}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-secondary p-4 rounded-lg">
                <img src={twoFactorQR} alt="2FA QR Code" className="mx-auto" />
                <p className="text-center mt-2 text-sm text-muted-foreground">
                  Secret: {twoFactorSecret}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Scan this QR code with your authenticator app and enter the verification code below.
              </p>
              <div>
                <label className="block text-sm font-medium mb-1">Verification Code</label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-secondary"
                  placeholder="Enter verification code"
                />
              </div>
              <button
                onClick={handleVerify2FA}
                className="w-full bg-primary text-primary-foreground py-2 rounded-lg"
              >
                Verify and Enable 2FA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connected Devices Modal */}
      {showDevicesModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-background border border-secondary rounded-2xl p-8 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Connected Devices</h3>
              <button
                onClick={() => setShowDevicesModal(false)}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              {connectedDevices.map((device, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-secondary rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {device.device.toLowerCase().includes('mobile') ? (
                      <Smartphone className="h-5 w-5" />
                    ) : device.device.toLowerCase().includes('tablet') ? (
                      <Tablet className="h-5 w-5" />
                    ) : (
                      <Laptop className="h-5 w-5" />
                    )}
                    <div>
                      <p className="font-medium">{device.device}</p>
                      <p className="text-sm text-muted-foreground">
                        Last active: {device.lastActive}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeviceRevoke(device.device)}
                    className="text-red-500 hover:text-red-600 transition-colors"
                  >
                    Revoke Access
                  </button>
                </div>
              ))}
              {connectedDevices.length === 0 && (
                <p className="text-center text-muted-foreground">
                  No connected devices found
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="py-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow overflow-hidden sm:rounded-lg"
        >
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Preferences
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Manage your application preferences and notification settings.
            </p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              {settingsItems.map((item) => (
                <div
                  key={item.name}
                  className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
                >
                  <dt className="text-sm font-medium text-gray-500">{item.name}</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">{item.description}</p>
                      <Switch
                        checked={settings[item.setting as keyof typeof settings]}
                        onChange={() => handleToggle(item.setting as keyof typeof settings)}
                        className={classNames(
                          settings[item.setting as keyof typeof settings]
                            ? 'bg-indigo-600'
                            : 'bg-gray-200',
                          'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
                        )}
                      >
                        <span className="sr-only">Use setting</span>
                        <span
                          className={classNames(
                            settings[item.setting as keyof typeof settings]
                              ? 'translate-x-5'
                              : 'translate-x-0',
                            'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                          )}
                        >
                          <span
                            className={classNames(
                              settings[item.setting as keyof typeof settings]
                                ? 'opacity-0 duration-100 ease-out'
                                : 'opacity-100 duration-200 ease-in',
                              'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity'
                            )}
                            aria-hidden="true"
                          >
                            <svg
                              className="h-3 w-3 text-gray-400"
                              fill="none"
                              viewBox="0 0 12 12"
                            >
                              <path
                                d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                          <span
                            className={classNames(
                              settings[item.setting as keyof typeof settings]
                                ? 'opacity-100 duration-200 ease-in'
                                : 'opacity-0 duration-100 ease-out',
                              'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity'
                            )}
                            aria-hidden="true"
                          >
                            <svg
                              className="h-3 w-3 text-indigo-600"
                              fill="currentColor"
                              viewBox="0 0 12 12"
                            >
                              <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                            </svg>
                          </span>
                        </span>
                      </Switch>
                    </div>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Settings;