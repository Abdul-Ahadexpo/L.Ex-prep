import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

interface NotificationSettings {
  enabled: boolean;
  reminderOffset: number; // minutes before task
}

interface NotificationContextType {
  permission: NotificationPermission;
  settings: NotificationSettings;
  requestPermission: () => Promise<void>;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  scheduleTaskNotifications: (tasks: any[]) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    reminderOffset: 5
  });
  const [scheduledTimeouts, setScheduledTimeouts] = useState<NodeJS.Timeout[]>([]);

  useEffect(() => {
    // Check initial permission status
    if ('Notification' in window) {
      setPermission(Notification.permission);
    } else {
      console.warn('This browser does not support notifications');
    }

    // Load settings from localStorage
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading notification settings:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Save settings to localStorage whenever they change
    try {
      localStorage.setItem('notificationSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }, [settings]);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        // Test notification
        showNotification('🎉 Notifications Enabled!', 'You\'ll now receive task reminders', 'test');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const clearAllNotifications = () => {
    scheduledTimeouts.forEach(timeout => clearTimeout(timeout));
    setScheduledTimeouts([]);
  };

  const scheduleTaskNotifications = (tasks: any[]) => {
    // Clear existing notifications first
    clearAllNotifications();

    if (!settings.enabled || permission !== 'granted' || !('Notification' in window)) {
      return;
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const newTimeouts: NodeJS.Timeout[] = [];

    tasks.forEach(task => {
      // Only schedule for today's tasks that aren't completed
      if (task.date !== today || task.completed) return;

      const [hours, minutes] = task.time.split(':').map(Number);
      const taskDate = new Date();
      taskDate.setHours(hours, minutes, 0, 0);

      // Skip if task time has already passed
      if (taskDate <= now) return;

      // Schedule reminder notification (X minutes before)
      const reminderTime = new Date(taskDate.getTime() - settings.reminderOffset * 60 * 1000);
      if (reminderTime > now) {
        const reminderTimeout = setTimeout(() => {
          showNotification(
            '⏰ Upcoming Task',
            `${task.content} starts at ${formatTime(task.time)}`,
            'reminder'
          );
        }, reminderTime.getTime() - now.getTime());
        newTimeouts.push(reminderTimeout);
      }

      // Schedule start notification (exactly at task time)
      const startTimeout = setTimeout(() => {
        showNotification(
          '🚀 Task Starting Now',
          task.content,
          'start'
        );
      }, taskDate.getTime() - now.getTime());
      newTimeouts.push(startTimeout);
    });

    setScheduledTimeouts(newTimeouts);
    
    if (newTimeouts.length > 0) {
      console.log(`Scheduled ${newTimeouts.length} notifications for today's tasks`);
    }
  };

  const showNotification = (title: string, body: string, type: 'reminder' | 'start' | 'test') => {
    if (permission !== 'granted' || !('Notification' in window)) return;

    try {
      const notification = new Notification(title, {
        body,
        icon: '/vite.svg',
        badge: '/vite.svg',
        tag: `task-${type}-${Date.now()}`,
        requireInteraction: type === 'start', // Keep start notifications visible longer
        silent: false,
        vibrate: type === 'start' ? [200, 100, 200] : [100] // Stronger vibration for start notifications
      });

      // Auto-close notification after specified time
      const autoCloseTime = type === 'start' ? 10000 : 5000; // 10s for start, 5s for others
      setTimeout(() => {
        notification.close();
      }, autoCloseTime);

      // Handle notification click
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Handle notification error
      notification.onerror = (error) => {
        console.error('Notification error:', error);
      };

    } catch (error) {
      console.error('Error showing notification:', error);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const value = {
    permission,
    settings,
    requestPermission,
    updateSettings,
    scheduleTaskNotifications,
    clearAllNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};