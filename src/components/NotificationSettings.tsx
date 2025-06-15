import React from 'react';
import { Bell, BellOff, Clock, X } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';

interface NotificationSettingsProps {
  onClose: () => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ onClose }) => {
  const { permission, settings, updateSettings, requestPermission } = useNotifications();

  const handleToggleNotifications = async () => {
    if (permission !== 'granted' && !settings.enabled) {
      await requestPermission();
    }
    updateSettings({ enabled: !settings.enabled });
  };

  const handleReminderOffsetChange = (offset: number) => {
    updateSettings({ reminderOffset: offset });
  };

  const reminderOptions = [
    { value: 1, label: '1 minute' },
    { value: 5, label: '5 minutes' },
    { value: 10, label: '10 minutes' },
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Notification Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Permission Status */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Permission Status
            </h3>
            <div className={`flex items-center space-x-2 p-3 rounded-lg ${
              permission === 'granted' 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                : permission === 'denied'
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                  : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
            }`}>
              {permission === 'granted' ? (
                <>
                  <Bell className="w-4 h-4" />
                  <span className="text-sm">Notifications enabled</span>
                </>
              ) : permission === 'denied' ? (
                <>
                  <BellOff className="w-4 h-4" />
                  <span className="text-sm">Notifications blocked</span>
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4" />
                  <span className="text-sm">Permission not requested</span>
                </>
              )}
            </div>
            
            {permission === 'denied' && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                To enable notifications, please allow them in your browser settings and refresh the page.
              </p>
            )}
          </div>

          {/* Enable/Disable Toggle */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Notifications
            </h3>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                {settings.enabled ? (
                  <Bell className="w-5 h-5 text-blue-500" />
                ) : (
                  <BellOff className="w-5 h-5 text-gray-400" />
                )}
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Task reminders
                </span>
              </div>
              <button
                onClick={handleToggleNotifications}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.enabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Reminder Timing */}
          {settings.enabled && permission === 'granted' && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Reminder Timing</span>
              </h3>
              <div className="space-y-2">
                {reminderOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleReminderOffsetChange(option.value)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      settings.reminderOffset === option.value
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                        : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Remind me {option.label} before</span>
                      {settings.reminderOffset === option.value && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;