import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useData } from '../contexts/DataContext';
import { Plus, Clock, Check, LogOut, User, Bell, Settings, Database, HardDrive, Cloud, Edit, Sparkles } from 'lucide-react';
import RoutineInput from './RoutineInput';
import ManualRoutineForm from './ManualRoutineForm';
import Timeline from './Timeline';
import NotificationPrompt from './NotificationPrompt';
import NotificationSettings from './NotificationSettings';
import DataSyncPrompt from './DataSyncPrompt';
import DataManager from './DataManager';

const Dashboard: React.FC = () => {
  const { user, logout, signInWithGoogle } = useAuth();
  const { permission, scheduleTaskNotifications } = useNotifications();
  const { tasks, loading, isGuestMode, hasLocalData, updateTask } = useData();
  const [showInput, setShowInput] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showDataSyncPrompt, setShowDataSyncPrompt] = useState(false);
  const [showDataManager, setShowDataManager] = useState(false);

  // Schedule notifications when tasks change
  useEffect(() => {
    scheduleTaskNotifications(tasks);
  }, [tasks, scheduleTaskNotifications]);

  // Show notification prompt on first visit (after login)
  useEffect(() => {
    const hasSeenPrompt = localStorage.getItem('hasSeenNotificationPrompt');
    if (!hasSeenPrompt && permission === 'default' && tasks.length > 0) {
      setShowNotificationPrompt(true);
      localStorage.setItem('hasSeenNotificationPrompt', 'true');
    }
  }, [permission, tasks.length]);

  // Show data sync prompt when user logs in with local data
  useEffect(() => {
    if (user && hasLocalData) {
      const hasSeenSyncPrompt = sessionStorage.getItem('hasSeenSyncPrompt');
      if (!hasSeenSyncPrompt) {
        setShowDataSyncPrompt(true);
        sessionStorage.setItem('hasSeenSyncPrompt', 'true');
      }
    }
  }, [user, hasLocalData]);

  const toggleTask = async (taskId: string, completed: boolean) => {
    try {
      await updateTask(taskId, { completed: !completed });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const getCurrentTask = () => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    return tasks.find(task => {
      const [hours, minutes] = task.time.split(':').map(Number);
      const taskTime = hours * 60 + minutes;
      
      let endTime = taskTime + 60; // Default 1 hour duration
      if (task.endTime) {
        const [endHours, endMinutes] = task.endTime.split(':').map(Number);
        endTime = endHours * 60 + endMinutes;
      }
      
      return currentTime >= taskTime && currentTime < endTime && !task.completed;
    });
  };

  const currentTask = getCurrentTask();
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">L.Ex</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                <span>L.Ex prep</span>
                {isGuestMode && (
                  <span className="inline-flex items-center space-x-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-xs font-medium">
                    <HardDrive className="w-3 h-3" />
                    <span>Guest Mode</span>
                  </span>
                )}
                {!isGuestMode && (
                  <span className="inline-flex items-center space-x-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                    <Cloud className="w-3 h-3" />
                    <span>Cloud Sync</span>
                  </span>
                )}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isGuestMode ? (
                  'LateExam-Preparation • Data saved locally'
                ) : (
                  `Welcome back, ${user?.displayName?.split(' ')[0]}! • ${new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}`
                )}
              </p>
            </div>
          </div>
          
          {/* Right side buttons */}
          <div className="flex items-center space-x-2">
            {/* Login/Profile Button */}
            {isGuestMode ? (
              <div className="flex flex-col items-end">
                <button
                  onClick={signInWithGoogle}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2 text-sm font-medium"
                >
                  <span>🔒</span>
                  <span className="hidden sm:inline">Sign in to sync</span>
                  <span className="sm:hidden">Sign in</span>
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right max-w-32">
                  Save data across devices ☁️
                </p>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  {user?.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt="Profile" 
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <User className="w-5 h-5 text-green-600 dark:text-green-400" />
                  )}
                  <span className="text-sm font-medium text-green-700 dark:text-green-300 hidden sm:inline">
                    {user?.displayName?.split(' ')[0]}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
            
            {/* Other buttons */}
            <button
              onClick={() => setShowDataManager(true)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title="Data Management"
            >
              <Database className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowNotificationSettings(true)}
              className={`p-2 rounded-lg transition-colors ${
                permission === 'granted' 
                  ? 'text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
              title="Notification Settings"
            >
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Guest Mode Welcome */}
        {isGuestMode && tasks.length === 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">L.Ex</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome to L.Ex prep! ⚡
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Your smart exam routine tracker is ready to use instantly. Start by adding your first routine below!
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
                <HardDrive className="w-4 h-4" />
                <span>Running in Guest Mode • Data saved locally</span>
              </div>
            </div>
          </div>
        )}

        {/* Progress Card */}
        {tasks.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Progress</h2>
              <div className="text-2xl font-bold text-blue-500">
                {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>{completedTasks} completed</span>
              <span>{totalTasks} total tasks</span>
            </div>
          </div>
        )}

        {/* Current Task */}
        {currentTask && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center space-x-3 mb-3">
              <Clock className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Current Task</h3>
            </div>
            <p className="text-lg mb-3">{currentTask.content}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm opacity-90">
                {currentTask.time} {currentTask.endTime && `- ${currentTask.endTime}`}
              </span>
              <button
                onClick={() => toggleTask(currentTask.id, currentTask.completed)}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all duration-200"
              >
                Mark Complete
              </button>
            </div>
          </div>
        )}

        {/* Add Routine Options */}
        {tasks.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
            <Clock className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Ready to create your routine?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Choose how you'd like to add your exam preparation schedule.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setShowManualForm(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
              >
                <Edit className="w-5 h-5" />
                <span>Add Manually</span>
              </button>
              <button
                onClick={() => setShowInput(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-5 h-5" />
                <span>Paste Routine</span>
              </button>
            </div>
          </div>
        )}

        {/* Timeline */}
        {tasks.length > 0 && (
          <Timeline tasks={tasks} onToggleTask={toggleTask} />
        )}

        {/* Floating Action Buttons */}
        <div className="fixed bottom-6 right-6 flex flex-col space-y-3">
          <button
            onClick={() => setShowManualForm(true)}
            className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
            title="Add Routine Manually"
          >
            <Edit className="w-6 h-6" />
          </button>
          <button
            onClick={() => setShowInput(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
            title="Paste Routine"
          >
            <Sparkles className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Modals */}
      {showInput && (
        <RoutineInput 
          onClose={() => setShowInput(false)}
          onSave={() => setShowInput(false)}
        />
      )}

      {showManualForm && (
        <ManualRoutineForm 
          onClose={() => setShowManualForm(false)}
          onSave={() => setShowManualForm(false)}
        />
      )}

      {showNotificationPrompt && (
        <NotificationPrompt 
          onClose={() => setShowNotificationPrompt(false)}
        />
      )}

      {showNotificationSettings && (
        <NotificationSettings 
          onClose={() => setShowNotificationSettings(false)}
        />
      )}

      {showDataSyncPrompt && (
        <DataSyncPrompt 
          onClose={() => setShowDataSyncPrompt(false)}
        />
      )}

      {showDataManager && (
        <DataManager 
          onClose={() => setShowDataManager(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;