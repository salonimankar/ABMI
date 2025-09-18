import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase, supabaseConfigured } from '../lib/supabase';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Briefcase,
  BookOpen,
  Github,
  Linkedin,
  Save,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface FormData {
  name: string;
  email: string;
  bio: string;
  skills: string[];
  github_profile: string;
  linkedin_profile: string;
}

export default function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    bio: '',
    skills: [],
    github_profile: '',
    linkedin_profile: '',
  });

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user || !supabaseConfigured) {
      // Mock data fallback
      setFormData({
        name: 'John Doe',
        email: user?.email || 'user@example.com',
        bio: 'Aspiring software engineer passionate about building delightful products.',
        skills: ['React', 'TypeScript', 'Node.js'],
        github_profile: 'https://github.com/username',
        linkedin_profile: 'https://linkedin.com/in/username',
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      setFormData({
        name: (profile as any).name || '',
        email: (profile as any).email || user.email || '',
        bio: (profile as any).bio || '',
        skills: (profile as any).skills || [],
        github_profile: (profile as any).github_profile || '',
        linkedin_profile: (profile as any).linkedin_profile || '',
      });
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile');
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !supabaseConfigured) {
      toast.success('Profile saved (mock)');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          bio: formData.bio,
          skills: formData.skills,
          github_profile: formData.github_profile,
          linkedin_profile: formData.linkedin_profile,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast.success('Profile updated successfully');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const skills = e.target.value.split(',').map((skill) => skill.trim());
    setFormData((prev) => ({
      ...prev,
      skills,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-primary">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading profile...</span>
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
    <div className="space-y-8 text-gray-100">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white">Profile</h1>
          <p className="text-gray-300 mt-2">
            Manage your personal information and professional details
          </p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground flex items-center gap-2 disabled:opacity-50"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          <Save className="h-4 w-4" />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-gray-900/60 border border-gray-700 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-950/70 border border-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-2 rounded-lg bg-gray-900/60 border border-gray-700 text-gray-400 opacity-70"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-950/70 border border-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                rows={3}
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>
        </div>

        {/* Professional Details */}
        <div className="bg-gray-900/60 border border-gray-700 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Professional Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Skills</label>
              <input
                type="text"
                value={formData.skills.join(', ')}
                onChange={handleSkillsChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-950/70 border border-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                placeholder="React, TypeScript, Node.js"
              />
              <p className="text-sm text-gray-400 mt-1">
                Separate skills with commas
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">GitHub Profile</label>
              <input
                type="url"
                name="github_profile"
                value={formData.github_profile}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-950/70 border border-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                placeholder="https://github.com/username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">LinkedIn Profile</label>
              <input
                type="url"
                name="linkedin_profile"
                value={formData.linkedin_profile}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-950/70 border border-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                placeholder="https://linkedin.com/in/username"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 