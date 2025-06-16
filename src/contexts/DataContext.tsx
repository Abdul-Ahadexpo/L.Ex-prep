import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { collection, addDoc, onSnapshot, query, where, orderBy, updateDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase/config';

export interface Task {
  id: string;
  time: string;
  endTime?: string;
  content: string;
  tag: string;
  completed: boolean;
  date: string;
  userId?: string;
}

interface DataContextType {
  tasks: Task[];
  loading: boolean;
  isGuestMode: boolean;
  hasLocalData: boolean;
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  exportData: () => void;
  importData: (data: any) => Promise<void>;
  syncLocalToCloud: () => Promise<void>;
  clearLocalData: () => void;
  setGuestMode: (isGuest: boolean) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false); // Start with false for instant guest mode
  const [hasLocalData, setHasLocalData] = useState(false);
  const [guestMode, setGuestModeState] = useState(true); // Default to guest mode

  const isGuestMode = !user || guestMode;

  // Check for local data on mount
  useEffect(() => {
    const localTasks = localStorage.getItem('lexprep_tasks');
    setHasLocalData(!!localTasks && JSON.parse(localTasks).length > 0);
  }, []);

  // Initialize with guest mode immediately
  useEffect(() => {
    loadFromLocalStorage();
  }, []);

  // Handle auth state changes
  useEffect(() => {
    if (user && !guestMode) {
      // Load from Firebase for logged-in users
      loadFromFirebase();
    } else if (!user) {
      // Reset to guest mode if user logs out
      setGuestModeState(true);
      loadFromLocalStorage();
    }
  }, [user, guestMode]);

  const setGuestMode = (isGuest: boolean) => {
    setGuestModeState(isGuest);
    if (isGuest) {
      loadFromLocalStorage();
    }
  };

  const loadFromFirebase = () => {
    if (!user || guestMode) return;

    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const q = query(
      collection(db, 'tasks'),
      where('userId', '==', user.uid),
      where('date', '==', today),
      orderBy('time')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
      setTasks(tasksData);
      setLoading(false);
    });

    return unsubscribe;
  };

  const loadFromLocalStorage = () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const localTasks = localStorage.getItem('lexprep_tasks');
      if (localTasks) {
        const allTasks = JSON.parse(localTasks) as Task[];
        const todayTasks = allTasks.filter(task => task.date === today);
        setTasks(todayTasks.sort((a, b) => a.time.localeCompare(b.time)));
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      setTasks([]);
    }
    setLoading(false);
  };

  const saveToLocalStorage = (newTasks: Task[]) => {
    try {
      // Get all existing tasks from localStorage
      const existingTasks = JSON.parse(localStorage.getItem('lexprep_tasks') || '[]') as Task[];
      
      // Filter out today's tasks and add the new ones
      const today = new Date().toISOString().split('T')[0];
      const otherDayTasks = existingTasks.filter(task => task.date !== today);
      const allTasks = [...otherDayTasks, ...newTasks];
      
      localStorage.setItem('lexprep_tasks', JSON.stringify(allTasks));
      setHasLocalData(allTasks.length > 0);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  const addTask = async (taskData: Omit<Task, 'id'>) => {
    if (user && !guestMode) {
      // Add to Firebase
      await addDoc(collection(db, 'tasks'), {
        ...taskData,
        userId: user.uid
      });
    } else {
      // Add to localStorage
      const newTask: Task = {
        ...taskData,
        id: Date.now().toString()
      };
      const updatedTasks = [...tasks, newTask].sort((a, b) => a.time.localeCompare(b.time));
      setTasks(updatedTasks);
      saveToLocalStorage(updatedTasks);
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    if (user && !guestMode) {
      // Update in Firebase
      await updateDoc(doc(db, 'tasks', taskId), updates);
    } else {
      // Update in localStorage
      const updatedTasks = tasks.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      );
      setTasks(updatedTasks);
      saveToLocalStorage(updatedTasks);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (user && !guestMode) {
      // Delete from Firebase
      // Note: You'll need to implement deleteDoc from Firestore
      console.log('Delete from Firebase not implemented yet');
    } else {
      // Delete from localStorage
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      setTasks(updatedTasks);
      saveToLocalStorage(updatedTasks);
    }
  };

  const exportData = () => {
    try {
      const allTasks = localStorage.getItem('lexprep_tasks');
      const exportData = {
        tasks: allTasks ? JSON.parse(allTasks) : [],
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `lexprep-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      throw new Error('Failed to export data');
    }
  };

  const importData = async (data: any) => {
    try {
      if (!data.tasks || !Array.isArray(data.tasks)) {
        throw new Error('Invalid data format');
      }

      if (user && !guestMode) {
        // Import to Firebase
        const batch = writeBatch(db);
        data.tasks.forEach((task: any) => {
          const taskRef = doc(collection(db, 'tasks'));
          batch.set(taskRef, {
            ...task,
            userId: user.uid,
            id: undefined // Let Firestore generate the ID
          });
        });
        await batch.commit();
      } else {
        // Import to localStorage
        localStorage.setItem('lexprep_tasks', JSON.stringify(data.tasks));
        loadFromLocalStorage();
      }
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('Failed to import data');
    }
  };

  const syncLocalToCloud = async () => {
    if (!user) return;

    try {
      const localTasks = localStorage.getItem('lexprep_tasks');
      if (!localTasks) return;

      const tasks = JSON.parse(localTasks) as Task[];
      const batch = writeBatch(db);

      tasks.forEach(task => {
        const taskRef = doc(collection(db, 'tasks'));
        batch.set(taskRef, {
          ...task,
          userId: user.uid,
          id: undefined // Let Firestore generate the ID
        });
      });

      await batch.commit();
      
      // Clear local data after successful sync and switch to cloud mode
      localStorage.removeItem('lexprep_tasks');
      setHasLocalData(false);
      setGuestModeState(false); // Switch to cloud mode
    } catch (error) {
      console.error('Error syncing to cloud:', error);
      throw new Error('Failed to sync data to cloud');
    }
  };

  const clearLocalData = () => {
    localStorage.removeItem('lexprep_tasks');
    setHasLocalData(false);
    if (isGuestMode) {
      setTasks([]);
    }
  };

  const value = {
    tasks,
    loading,
    isGuestMode,
    hasLocalData,
    addTask,
    updateTask,
    deleteTask,
    exportData,
    importData,
    syncLocalToCloud,
    clearLocalData,
    setGuestMode
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};