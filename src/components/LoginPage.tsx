import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { BookOpen, Calendar, CheckCircle, Cloud, HardDrive, ArrowRight } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { signInWithGoogle } = useAuth();
  const { hasLocalData } = useData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-full shadow-lg">
              <BookOpen className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            L.Ex prep
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            LateExam-Preparation
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
            Your smart exam routine tracker
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
              <Calendar className="w-5 h-5 text-blue-500" />
              <span>Smart routine parsing</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Real-time progress tracking</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
              <Cloud className="w-5 h-5 text-purple-500" />
              <span>Cloud sync across devices</span>
            </div>
          </div>

          {hasLocalData && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300 mb-2">
                <HardDrive className="w-4 h-4" />
                <span className="font-medium text-sm">Local data found!</span>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Sign in to sync your existing routines to the cloud
              </p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={signInWithGoogle}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Sign in with Google</span>
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  or
                </span>
              </div>
            </div>

            <button
              onClick={() => window.location.href = '/dashboard'}
              className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3"
            >
              <HardDrive className="w-5 h-5" />
              <span>Continue as Guest</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Guest mode saves data locally • Sign in for cloud sync
        </p>
      </div>
    </div>
  );
};

export default LoginPage;