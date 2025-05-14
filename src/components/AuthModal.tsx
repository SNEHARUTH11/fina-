import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogIn, UserPlus, X, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="px-8 pt-12 pb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {mode === 'login' ? 'Welcome Back!' : 'Create Account'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {mode === 'login'
              ? 'Access your portfolio and start trading'
              : 'Join thousands of traders and investors'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 pb-12 space-y-6">
          {/* Email Field */}
          <div>
            <div className="relative">
              <label
                htmlFor="email"
                className="absolute -top-2 left-2 bg-white dark:bg-gray-900 px-1 text-xs font-medium text-gray-500 dark:text-gray-400"
              >
                Email Address
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl 
                    bg-transparent text-gray-900 dark:text-white placeholder-gray-400
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                    transition-colors text-sm"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="relative">
              <label
                htmlFor="password"
                className="absolute -top-2 left-2 bg-white dark:bg-gray-900 px-1 text-xs font-medium text-gray-500 dark:text-gray-400"
              >
                Password
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl 
                    bg-transparent text-gray-900 dark:text-white placeholder-gray-400
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                    transition-colors text-sm"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff size={18} className="text-gray-400 hover:text-gray-500" />
                  ) : (
                    <Eye size={18} className="text-gray-400 hover:text-gray-500" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent 
              rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
              disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <div className="flex items-center">
                {mode === 'login' ? (
                  <>
                    Sign In
                    <ArrowRight size={18} className="ml-2" />
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={18} className="ml-2" />
                  </>
                )}
              </div>
            )}
          </button>

          {/* Mode Toggle */}
          <div className="text-center space-y-2">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-2 bg-white dark:bg-gray-900 text-sm text-gray-500 dark:text-gray-400">
                  {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-blue-600 hover:text-blue-500 dark:text-blue-400 text-sm font-medium"
            >
              {mode === 'login' ? 'Sign up now' : 'Sign in instead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;