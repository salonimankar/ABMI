import React, { useState } from 'react';
import {
  Briefcase,
  Code,
  Users,
  Brain,
  Gauge,
  Eye,
  Languages,
  Clock,
  Mic,
  Video,
  MessageSquare,
  Settings,
  Loader2,
  AlertCircle,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import { useCustomModes } from '../hooks/useCustomModes';
import { toast } from 'sonner';
import { CustomMode } from '../lib/types';
import { z } from 'zod';

const customModeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  type: z.enum(['general', 'technical', 'behavioral', 'case-study']),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  settings: z.record(z.boolean()),
});

const settingsLabels = {
  eyeTracking: 'Eye Tracking',
  multilingualSupport: 'Multilingual Support',
  timedResponses: 'Timed Responses',
  realTimeFeedback: 'Real-time Feedback',
  aiAssistant: 'AI Assistant',
  adaptiveDifficulty: 'Adaptive Difficulty',
  videoRecording: 'Video Recording',
  audioRecording: 'Audio Recording',
  transcription: 'Transcription',
};

function CustomModes() {
  const { modes, loading, error, createMode, updateMode, deleteMode } = useCustomModes();
  const [showNewMode, setShowNewMode] = useState(false);
  const [editingMode, setEditingMode] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<CustomMode>>({
    name: '',
    type: 'general',
    difficulty: 'intermediate',
    settings: {
      eyeTracking: true,
      multilingualSupport: false,
      timedResponses: true,
      realTimeFeedback: true,
      aiAssistant: true,
      adaptiveDifficulty: true,
      videoRecording: true,
      audioRecording: true,
      transcription: true,
    },
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    try {
      customModeSchema.parse(formData);
      setFormErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path[0]) {
            errors[error.path[0].toString()] = error.message;
          }
        });
        setFormErrors(errors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    try {
      if (editingMode) {
        await updateMode(editingMode, formData);
        toast.success('Mode updated successfully');
        setEditingMode(null);
      } else {
        await createMode(formData);
        toast.success('New mode created successfully');
      }
      setShowNewMode(false);
      resetForm();
    } catch (err) {
      console.error('Error saving mode:', err);
      toast.error('Failed to save mode');
    }
  };

  const handleEdit = (mode: CustomMode) => {
    setEditingMode(mode.id);
    setFormData({
      name: mode.name,
      type: mode.type,
      difficulty: mode.difficulty,
      settings: mode.settings,
    });
    setShowNewMode(true);
    setFormErrors({});
  };

  const handleDelete = async (id: string) => {
    try {
      if (window.confirm('Are you sure you want to delete this mode?')) {
        await deleteMode(id);
        toast.success('Mode deleted successfully');
      }
    } catch (err) {
      console.error('Error deleting mode:', err);
      toast.error('Failed to delete mode');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'general',
      difficulty: 'intermediate',
      settings: {
        eyeTracking: true,
        multilingualSupport: false,
        timedResponses: true,
        realTimeFeedback: true,
        aiAssistant: true,
        adaptiveDifficulty: true,
        videoRecording: true,
        audioRecording: true,
        transcription: true,
      },
    });
    setFormErrors({});
  };

  const handleCancel = () => {
    setShowNewMode(false);
    setEditingMode(null);
    resetForm();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-primary">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading custom modes...</span>
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
          <h1 className="text-3xl font-bold">Custom Interview Modes</h1>
          <p className="text-muted-foreground mt-2">
            Customize your interview experience based on your needs and preferences
          </p>
        </div>
        <button
          onClick={() => {
            setShowNewMode(true);
            resetForm();
          }}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground flex items-center gap-2 hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create New Mode
        </button>
      </div>

      {/* Custom Modes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modes.map((mode) => (
          <div key={mode.id} className="bg-secondary rounded-2xl p-6 hover:bg-secondary/80 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{mode.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-sm">
                    {mode.type}
                  </span>
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-sm">
                    {mode.difficulty}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(mode)}
                  className="p-2 rounded-lg hover:bg-accent transition-colors"
                  title="Edit Mode"
                >
                  <Settings className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(mode.id)}
                  className="p-2 rounded-lg hover:bg-accent transition-colors text-red-500"
                  title="Delete Mode"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {Object.entries(mode.settings).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {settingsLabels[key as keyof typeof settingsLabels]}
                  </span>
                  <div
                    className={`w-10 h-6 rounded-full relative transition-colors ${
                      value ? 'bg-primary' : 'bg-accent'
                    }`}
                  >
                    <div
                      className={`absolute w-5 h-5 rounded-full bg-white transform transition-transform ${
                        value ? 'translate-x-4' : 'translate-x-0.5'
                      } top-0.5`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {showNewMode && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-background border border-secondary rounded-2xl p-8 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">
                {editingMode ? 'Edit Mode' : 'Create New Mode'}
              </h2>
              <button
                onClick={handleCancel}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={`w-full px-4 py-2 rounded-lg bg-secondary ${
                    formErrors.name ? 'border-red-500' : ''
                  }`}
                  placeholder="Enter mode name"
                  required
                />
                {formErrors.name && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className={`w-full px-4 py-2 rounded-lg bg-secondary ${
                      formErrors.type ? 'border-red-500' : ''
                    }`}
                  >
                    <option value="general">General</option>
                    <option value="technical">Technical</option>
                    <option value="behavioral">Behavioral</option>
                    <option value="case-study">Case Study</option>
                  </select>
                  {formErrors.type && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.type}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Difficulty
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) =>
                      setFormData({ ...formData, difficulty: e.target.value })
                    }
                    className={`w-full px-4 py-2 rounded-lg bg-secondary ${
                      formErrors.difficulty ? 'border-red-500' : ''
                    }`}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                  {formErrors.difficulty && (
                    <p className="text-sm text-red-500 mt-1">
                      {formErrors.difficulty}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4">Settings</h3>
                <div className="space-y-4">
                  {Object.entries(formData.settings || {}).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm">
                        {settingsLabels[key as keyof typeof settingsLabels]}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            settings: {
                              ...formData.settings,
                              [key]: !value,
                            },
                          })
                        }
                        className={`w-10 h-6 rounded-full relative transition-colors ${
                          value ? 'bg-primary' : 'bg-accent'
                        }`}
                      >
                        <div
                          className={`absolute w-5 h-5 rounded-full bg-white transform transition-transform ${
                            value ? 'translate-x-4' : 'translate-x-0.5'
                          } top-0.5`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground flex items-center gap-2 hover:bg-primary/90 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  {editingMode ? 'Save Changes' : 'Create Mode'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomModes;