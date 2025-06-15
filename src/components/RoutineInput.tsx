import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { X, Sparkles, Clock, Hash } from 'lucide-react';

interface RoutineInputProps {
  onClose: () => void;
  onSave: () => void;
}

const RoutineInput: React.FC<RoutineInputProps> = ({ onClose, onSave }) => {
  const { user } = useAuth();
  const [routineText, setRoutineText] = useState('');
  const [loading, setLoading] = useState(false);

  const parseRoutineText = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    const tasks = [];
    
    for (const line of lines) {
      // Match time patterns like "8:00 AM", "2:00 PM", "14:30"
      const timeRegex = /(\d{1,2}):(\d{2})\s*(AM|PM)?(?:\s*[–-]\s*(\d{1,2}):(\d{2})\s*(AM|PM)?)?/i;
      const match = line.match(timeRegex);
      
      if (match) {
        let startHour = parseInt(match[1]);
        const startMinute = parseInt(match[2]);
        const startPeriod = match[3]?.toUpperCase();
        
        let endHour = match[4] ? parseInt(match[4]) : null;
        const endMinute = match[5] ? parseInt(match[5]) : null;
        const endPeriod = match[6]?.toUpperCase();
        
        // Convert to 24-hour format
        if (startPeriod === 'PM' && startHour !== 12) startHour += 12;
        if (startPeriod === 'AM' && startHour === 12) startHour = 0;
        
        if (endHour !== null) {
          if (endPeriod === 'PM' && endHour !== 12) endHour += 12;
          if (endPeriod === 'AM' && endHour === 12) endHour = 0;
        }
        
        // Extract content (remove time and arrows)
        const content = line
          .replace(timeRegex, '')
          .replace(/[→–-]/g, '')
          .trim();
        
        // Determine tag based on content
        let tag = 'Other';
        const lowerContent = content.toLowerCase();
        if (lowerContent.includes('school') || lowerContent.includes('class')) tag = 'School';
        else if (lowerContent.includes('study') || lowerContent.includes('exam')) tag = 'Study';
        else if (lowerContent.includes('chat') || lowerContent.includes('social')) tag = 'Chat';
        else if (lowerContent.includes('break') || lowerContent.includes('lunch')) tag = 'Break';
        else if (lowerContent.includes('coaching') || lowerContent.includes('tuition')) tag = 'Coaching';
        
        tasks.push({
          time: `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`,
          endTime: endHour !== null ? `${endHour.toString().padStart(2, '0')}:${endMinute?.toString().padStart(2, '0')}` : undefined,
          content: content || 'Task',
          tag,
          completed: false,
          date: new Date().toISOString().split('T')[0],
          userId: user!.uid
        });
      }
    }
    
    return tasks;
  };

  const handleSave = async () => {
    if (!routineText.trim()) return;
    
    setLoading(true);
    try {
      const tasks = parseRoutineText(routineText);
      
      for (const task of tasks) {
        await addDoc(collection(db, 'tasks'), task);
      }
      
      onSave();
    } catch (error) {
      console.error('Error saving routine:', error);
    } finally {
      setLoading(false);
    }
  };

  const exampleText = `🏫 8:00 AM – 2:00 PM → School time (No chatting, focus time ✨)
🍂 Afternoon
🕑 2:00 PM – 3:00 PM
✅ If free, chat while chilling/lunch
❌ If it's a coaching day (Sat, Mon, Wed), just wish good luck & wait 😚
📚 3:00 PM – 5:00 PM → Study session
🎯 5:00 PM – 6:00 PM → Break time`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Smart Routine Parser
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Paste your routine text below:
            </label>
            <textarea
              value={routineText}
              onChange={(e) => setRoutineText(e.target.value)}
              placeholder={`Paste your routine here... For example:\n\n${exampleText}`}
              className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 space-y-3">
            <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
              <Clock className="w-4 h-4" />
              <span className="font-medium text-sm">Smart Features</span>
            </div>
            <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
              <li>• Automatically detects time ranges (8:00 AM, 2:00 PM, etc.)</li>
              <li>• Extracts task content and descriptions</li>
              <li>• Auto-tags tasks (School, Study, Chat, Break, etc.)</li>
              <li>• Supports emojis and special characters</li>
            </ul>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 mb-2">
              <Hash className="w-4 h-4" />
              <span className="font-medium text-sm">Auto-Generated Tags</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['School', 'Study', 'Chat', 'Break', 'Coaching', 'Other'].map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!routineText.trim() || loading}
            className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-none flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Parse & Save</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoutineInput;