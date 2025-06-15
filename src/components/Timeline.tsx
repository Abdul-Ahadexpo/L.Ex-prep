import React from 'react';
import { Check, Clock, BookOpen, MessageCircle, Coffee, Users, MoreHorizontal } from 'lucide-react';
import { Task } from './Dashboard';

interface TimelineProps {
  tasks: Task[];
  onToggleTask: (taskId: string, completed: boolean) => void;
}

const Timeline: React.FC<TimelineProps> = ({ tasks, onToggleTask }) => {
  const getTagIcon = (tag: string) => {
    switch (tag) {
      case 'School': return <BookOpen className="w-4 h-4" />;
      case 'Study': return <BookOpen className="w-4 h-4" />;
      case 'Chat': return <MessageCircle className="w-4 h-4" />;
      case 'Break': return <Coffee className="w-4 h-4" />;
      case 'Coaching': return <Users className="w-4 h-4" />;
      default: return <MoreHorizontal className="w-4 h-4" />;
    }
  };

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'School': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Study': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'Chat': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'Break': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
      case 'Coaching': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  };

  const isTaskCurrent = (task: Task) => {
    const currentTime = getCurrentTime();
    const [hours, minutes] = task.time.split(':').map(Number);
    const taskTime = hours * 60 + minutes;
    
    let endTime = taskTime + 60; // Default 1 hour duration
    if (task.endTime) {
      const [endHours, endMinutes] = task.endTime.split(':').map(Number);
      endTime = endHours * 60 + endMinutes;
    }
    
    return currentTime >= taskTime && currentTime < endTime;
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
          <Clock className="w-5 h-5 text-blue-500" />
          <span>Today's Timeline</span>
        </h2>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

        <div className="space-y-0">
          {tasks.map((task, index) => {
            const isCurrent = isTaskCurrent(task);
            const isCompleted = task.completed;
            
            return (
              <div
                key={task.id}
                className={`relative flex items-start space-x-4 p-6 transition-all duration-200 ${
                  isCurrent ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                } ${index !== tasks.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''}`}
              >
                {/* Timeline dot */}
                <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                  isCurrent 
                    ? 'bg-blue-500 border-blue-500 scale-110' 
                    : isCompleted 
                      ? 'bg-green-500 border-green-500' 
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                }`}>
                  {isCompleted ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : isCurrent ? (
                    <Clock className="w-5 h-5 text-white animate-pulse" />
                  ) : (
                    <div className={`w-2 h-2 rounded-full ${
                      isCurrent ? 'bg-white' : 'bg-gray-400 dark:bg-gray-500'
                    }`}></div>
                  )}
                </div>

                {/* Task content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className={`text-sm font-medium transition-colors ${
                        isCurrent ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                      }`}>
                        {formatTime(task.time)}
                        {task.endTime && ` - ${formatTime(task.endTime)}`}
                      </span>
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getTagColor(task.tag)}`}>
                        {getTagIcon(task.tag)}
                        <span>{task.tag}</span>
                      </span>
                    </div>
                    
                    <button
                      onClick={() => onToggleTask(task.id, task.completed)}
                      className={`flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                        isCompleted
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
                      }`}
                    >
                      {isCompleted && <Check className="w-3 h-3 text-white" />}
                    </button>
                  </div>
                  
                  <p className={`text-sm leading-relaxed transition-colors ${
                    isCompleted 
                      ? 'text-gray-500 dark:text-gray-400 line-through' 
                      : isCurrent 
                        ? 'text-blue-700 dark:text-blue-300 font-medium'
                        : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {task.content}
                  </p>
                  
                  {isCurrent && (
                    <div className="mt-2 inline-flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 font-medium">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span>Currently active</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Timeline;