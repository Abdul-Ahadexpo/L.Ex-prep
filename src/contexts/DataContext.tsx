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
  error: string | null;
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  exportData: () => void;
  importData: (data: any) => Promise<void>;
  syncLocalToCloud: () => Promise<void>;
  clearLocalData: () => void;
  setGuestMode: (isGuest: boolean) => void;
  clearError: () => void;
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
  const [loading, setLoading] = useState(false);
  const [hasLocalData, setHasLocalData] = useState(false);
  const [guestMode, setGuestModeState] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine if we're in guest mode - FIXED LOGIC
  const isGuestMode = !user || guestMode;

  // Check for local data on mount
  useEffect(() => {
    const localTasks = localStorage.getItem('lexprep_tasks');
    setHasLocalData(!!localTasks && JSON.parse(localTasks).length > 0);
  }, []);

  // Initialize with guest mode immediately
  useEffect(() => {
    if (!user) {
      loadFromLocalStorage();
    }
  }, []);

  // Handle auth state changes - FIXED
  useEffect(() => {
    if (user && !guestMode) {
      console.log('User logged in, switching to Firebase mode');
      // User is logged in and not in guest mode - load from Firebase
      const unsubscribe = loadFromFirebase();
      return unsubscribe;
    } else if (!user) {
      console.log('User logged out, switching to guest mode');
      // User logged out - reset to guest mode
      setGuestModeState(true);
      loadFromLocalStorage();
    } else if (user && guestMode) {
      console.log('User logged in but still in guest mode');
      // User is logged in but we're still in guest mode
      // This happens right after login - we should switch to cloud mode
      setGuestModeState(false);
    }
  }, [user, guestMode]);

  const setGuestMode = (isGuest: boolean) => {
    console.log('Setting guest mode:', isGuest);
    setGuestModeState(isGuest);
    if (isGuest) {
      loadFromLocalStorage();
    }
  };

  const clearError = () => {
    setError(null);
  };

  const loadFromFirebase = () => {
    if (!user) {
      console.log('No user, cannot load from Firebase');
      return;
    }

    console.log('Loading data from Firebase for user:', user.email);
    setLoading(true);
    setError(null);
    
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
      console.log('Loaded tasks from Firebase:', tasksData.length);
      setTasks(tasksData);
      setLoading(false);
    }, (error) => {
      console.error('Error loading from Firebase:', error);
      setError('Failed to load data from cloud');
      setLoading(false);
    });

    return unsubscribe;
  };

  const loadFromLocalStorage = () => {
    console.log('Loading data from localStorage');
    try {
      const today = new Date().toISOString().split('T')[0];
      const localTasks = localStorage.getItem('lexprep_tasks');
      if (localTasks) {
        const allTasks = JSON.parse(localTasks) as Task[];
        const todayTasks = allTasks.filter(task => task.date === today);
        console.log('Loaded tasks from localStorage:', todayTasks.length);
        setTasks(todayTasks.sort((a, b) => a.time.localeCompare(b.time)));
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      setError('Failed to load local data');
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
      console.log('Saved to localStorage:', allTasks.length, 'total tasks');
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      setError('Failed to save data locally');
    }
  };

  const addTask = async (taskData: Omit<Task, 'id'>) => {
    setError(null);
    
    if (user && !guestMode) {
      // Add to Firebase
      try {
        console.log('Adding task to Firebase');
        await addDoc(collection(db, 'tasks'), {
          ...taskData,
          userId: user.uid
        });
      } catch (error) {
        console.error('Error adding task to Firebase:', error);
        setError('Failed to save task to cloud');
        throw error;
      }
    } else {
      // Add to localStorage
      console.log('Adding task to localStorage');
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
    setError(null);
    
    if (user && !guestMode) {
      // Update in Firebase
      try {
        await updateDoc(doc(db, 'tasks', taskId), updates);
      } catch (error) {
        console.error('Error updating task in Firebase:', error);
        setError('Failed to update task in cloud');
        throw error;
      }
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
    setError(null);
    
    if (user && !guestMode) {
      // Delete from Firebase
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
      setError('Failed to export data');
      throw new Error('Failed to export data');
    }
  };

  const importData = async (data: any) => {
    setError(null);
    console.log('Importing data:', data);
    
    try {
      // Validate data structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid file format - not a valid JSON object');
      }
      
      if (!data.tasks || !Array.isArray(data.tasks)) {
        throw new Error('Invalid file format - missing or invalid tasks array');
      }

      if (data.tasks.length === 0) {
        throw new Error('No tasks found in the file');
      }

      // Validate each task has required fields
      for (const task of data.tasks) {
        if (!task.time || !task.content || !task.tag || typeof task.completed !== 'boolean') {
          throw new Error('Invalid task format - missing required fields (time, content, tag, completed)');
        }
      }

      console.log(`Importing ${data.tasks.length} tasks`);

      if (user && !guestMode) {
        // Import to Firebase
        console.log('Importing to Firebase');
        const batch = writeBatch(db);
        let batchCount = 0;
        
        for (const task of data.tasks) {
          const taskRef = doc(collection(db, 'tasks'));
          batch.set(taskRef, {
            ...task,
            userId: user.uid,
            id: undefined // Let Firestore generate the ID
          });
          batchCount++;
          
          // Firestore batch limit is 500 operations
          if (batchCount >= 500) {
            await batch.commit();
            batchCount = 0;
          }
        }
        
        if (batchCount > 0) {
          await batch.commit();
        }
        
        console.log('Successfully imported to Firebase');
      } else {
        // Import to localStorage
        console.log('Importing to localStorage');
        
        // Get existing tasks
        const existingTasks = JSON.parse(localStorage.getItem('lexprep_tasks') || '[]') as Task[];
        
        // Add imported tasks with new IDs
        const importedTasks = data.tasks.map((task: any, index: number) => ({
          ...task,
          id: `imported_${Date.now()}_${index}`
        }));
        
        // Combine and save
        const allTasks = [...existingTasks, ...importedTasks];
        localStorage.setItem('lexprep_tasks', JSON.stringify(allTasks));
        
        // Reload current view
        loadFromLocalStorage();
        
        console.log('Successfully imported to localStorage');
      }
      
      // Show success message
      setError(null);
      
    } catch (error) {
      console.error('Error importing data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to import data';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const syncLocalToCloud = async () => {
    if (!user) {
      throw new Error('User must be logged in to sync data');
    }

    setError(null);
    console.log('Syncing local data to cloud');

    try {
      const localTasks = localStorage.getItem('lexprep_tasks');
      if (!localTasks) {
        console.log('No local data to sync');
        return;
      }

      const tasks = JSON.parse(localTasks) as Task[];
      console.log(`Syncing ${tasks.length} tasks to cloud`);
      
      const batch = writeBatch(db);
      let batchCount = 0;

      for (const task of tasks) {
        const taskRef = doc(collection(db, 'tasks'));
        batch.set(taskRef, {
          ...task,
          userId: user.uid,
          id: undefined // Let Firestore generate the ID
        });
        batchCount++;
        
        // Firestore batch limit is 500 operations
        if (batchCount >= 500) {
          await batch.commit();
          batchCount = 0;
        }
      }
      
      if (batchCount > 0) {
        await batch.commit();
      }

      // Clear local data after successful sync and switch to cloud mode
      localStorage.removeItem('lexprep_tasks');
      setHasLocalData(false);
      setGuestModeState(false); // Switch to cloud mode
      
      console.log('Successfully synced to cloud');
    } catch (error) {
      console.error('Error syncing to cloud:', error);
      setError('Failed to sync data to cloud');
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
    error,
    addTask,
    updateTask,
    deleteTask,
    exportData,
    importData,
    syncLocalToCloud,
    clearLocalData,
    setGuestMode,
    clearError
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
