import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useData } from '../contexts/DataContext';
import { Plus, Clock, Check, LogOut, User, Bell, Settings, Database, HardDrive, Cloud } from 'lucide-react';
import RoutineInput from './RoutineInput';
import Timeline from './Timeline';
import NotificationPrompt from './NotificationPrompt';
import NotificationSettings from './NotificationSettings';
import DataSyncPrompt from './DataSyncPrompt';
import DataManager from './DataManager';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { permission, scheduleTaskNotifications } = useNotifications();
  const { tasks, loading, isGuestMode, hasLocalData, updateTask } = useData();
  const [showInput, setShowInput] = useState(false);
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
          <div className="flex items-center space-x-2">
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
            {!isGuestMode && (
              <button
                onClick={logout}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Guest Mode Info */}
        {isGuestMode && (
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl p-4">
            <div className="flex items-start space-x-3">
              <HardDrive className="w-5 h-5 text-orange-500 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-orange-800 dark:text-orange-200">
                  You're using Guest Mode
                </h3>
                <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                  Your data is saved locally on this device. Sign in with Google to sync across devices and never lose your routines.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Progress Card */}
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

        {/* Timeline */}
        {tasks.length > 0 ? (
          <Timeline tasks={tasks} onToggleTask={toggleTask} />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
            <Clock className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No routine for today
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first routine to get started with tracking your exam preparation.
            </p>
            <button
              onClick={() => setShowInput(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Create Routine
            </button>
          </div>
        )}

        {/* Add Routine Button */}
        <div className="fixed bottom-6 right-6">
          <button
            onClick={() => setShowInput(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
          >
            <Plus className="w-6 h-6" />
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