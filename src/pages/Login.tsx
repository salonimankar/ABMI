import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Logo from '../components/Logo';

export default function Login() {
  const { signIn, signUp, resetPasswordEmail, user, sendPhoneOtp, verifyPhoneOtp, sendEmailOtp, verifyEmailOtp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [usePhoneOtp, setUsePhoneOtp] = useState(false);
  const [useEmailOtp, setUseEmailOtp] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Validate email format
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate password strength
  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (usePhoneOtp || useEmailOtp) {
      // In OTP mode, the submit button either sends or verifies based on state
      return;
    }

    // Email/password validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (isSignUp) {
      const passwordError = validatePassword(password);
      if (passwordError) {
        setError(passwordError);
        return;
      }
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
        toast.success('Account created! Please check your email to verify your account.');
        setIsSignUp(false);
        setEmail('');
        setPassword('');
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      await resetPasswordEmail(email);
      toast.success('Password reset instructions sent to your email');
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send reset email';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setError(null);
    if (usePhoneOtp) {
      if (!phone) {
        setError('Please enter your phone number');
        return;
      }
      if (!/^\+\d{8,15}$/.test(phone)) {
        setError('Enter phone in international format, e.g., +15551234567');
        return;
      }
    } else if (useEmailOtp) {
      if (!email) {
        setError('Please enter your email address');
        return;
      }
      if (!validateEmail(email)) {
        setError('Please enter a valid email address');
        return;
      }
    }
    setIsLoading(true);
    try {
      if (usePhoneOtp) {
        await sendPhoneOtp(phone);
      } else if (useEmailOtp) {
        await sendEmailOtp(email);
      }
      setOtpSent(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send OTP';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);
    if (!otp) {
      setError('Please enter the OTP');
      return;
    }
    setIsLoading(true);
    try {
      if (usePhoneOtp) {
        await verifyPhoneOtp(phone, otp);
      } else if (useEmailOtp) {
        await verifyEmailOtp(email, otp);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify OTP';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSignUp = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    setPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        <Logo />
        <div className="bg-gray-900/60 backdrop-blur p-8 rounded-2xl shadow-xl border border-gray-700 transform transition-all duration-300 hover:scale-[1.01]">
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-100">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            {isSignUp ? 'Join us today' : 'Sign in to your account'}
          </p>
          {!isSignUp && (
            <p className="mt-2 text-center text-sm text-gray-400">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                className="text-indigo-400 hover:text-indigo-300 underline"
              >
                Create one
              </button>
              {' '}or{' '}
              <a href="/register" className="text-indigo-400 hover:text-indigo-300 underline">register</a>
            </p>
          )}
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => { setUsePhoneOtp(false); setUseEmailOtp(false); setError(null); }}
              className={`px-3 py-1 rounded-md text-sm ${(!usePhoneOtp && !useEmailOtp) ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-300 border border-gray-700'}`}
            >
              Email & Password
            </button>
            <button
              type="button"
              onClick={() => { setUsePhoneOtp(true); setUseEmailOtp(false); setError(null); }}
              className={`px-3 py-1 rounded-md text-sm ${usePhoneOtp ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-300 border border-gray-700'}`}
            >
              Phone OTP
            </button>
            <button
              type="button"
              onClick={() => { setUseEmailOtp(true); setUsePhoneOtp(false); setError(null); }}
              className={`px-3 py-1 rounded-md text-sm ${useEmailOtp ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-300 border border-gray-700'}`}
            >
              Email OTP
            </button>
          </div>

          <form className="mt-4 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              {(!usePhoneOtp && !useEmailOtp) ? (
              <div className="transform transition-all duration-300 hover:scale-[1.02]">
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  className="appearance-none rounded-t-md relative block w-full px-3 py-3 border border-gray-700 placeholder-gray-400 text-gray-100 bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all duration-300"
                  placeholder="Email address"
                  disabled={isLoading}
                />
              </div>
              ) : usePhoneOtp ? (
              <div className="transform transition-all duration-300 hover:scale-[1.02]">
                <label htmlFor="phone" className="sr-only">
                  Phone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setError(null); }}
                  className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-700 placeholder-gray-400 text-gray-100 bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all duration-300"
                  placeholder="Phone (e.g., +15551234567)"
                  disabled={isLoading || otpSent}
                />
              </div>
              ) : (
                <div className="transform transition-all duration-300 hover:scale-[1.02]">
                  <label htmlFor="email-otp" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email-otp"
                    name="email-otp"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(null); }}
                    className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-700 placeholder-gray-400 text-gray-100 bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all duration-300"
                    placeholder="Email address"
                    disabled={isLoading || otpSent}
                  />
                </div>
              )}
              {(!usePhoneOtp && !useEmailOtp) ? (
              <div className="transform transition-all duration-300 hover:scale-[1.02]">
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(null);
                    }}
                    className="appearance-none rounded-b-md relative block w-full px-3 py-3 border border-gray-700 placeholder-gray-400 text-gray-100 bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all duration-300"
                    placeholder="Password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-400 hover:text-gray-200 transition-colors duration-300"
                    disabled={isLoading}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
              ) : (
              otpSent && (
                <div className="transform transition-all duration-300 hover:scale-[1.02] mt-4">
                  <label htmlFor="otp" className="sr-only">
                    OTP
                  </label>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required
                    value={otp}
                    onChange={(e) => { setOtp(e.target.value); setError(null); }}
                    className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-700 placeholder-gray-400 text-gray-100 bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all duration-300"
                    placeholder="Enter OTP"
                    disabled={isLoading}
                  />
                </div>
              )
              )}
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center animate-shake">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <button
                  type="button"
                  onClick={toggleSignUp}
                  className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors duration-300"
                  disabled={isLoading}
                >
                  {isSignUp ? 'Already have an account?' : 'Need an account?'}
                </button>
              </div>
              {!isSignUp && (
                <div className="text-sm">
                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors duration-300"
                    disabled={isLoading}
                  >
                    Forgot your password?
                  </button>
                </div>
              )}
            </div>

            {(!usePhoneOtp && !useEmailOtp) ? (
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02]"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {isSignUp ? 'Creating account...' : 'Signing in...'}
                    </div>
                  ) : (
                    isSignUp ? 'Create account' : 'Sign in'
                  )}
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                {!otpSent ? (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isLoading}
                    className="flex-1 group relative flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    {isLoading ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={isLoading}
                    className="flex-1 group relative flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    {isLoading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                )}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}