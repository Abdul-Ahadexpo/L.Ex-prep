import React from 'react';
import { Check, Clock, BookOpen, MessageCircle, Coffee, Users, MoreHorizontal } from 'lucide-react';
import { Task } from '../contexts/DataContext';

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
      case 'School': return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      case 'Study': return 'bg-purple-500/20 text-purple-300 border-purple-400/30';
      case 'Chat': return 'bg-green-500/20 text-green-300 border-green-400/30';
      case 'Break': return 'bg-orange-500/20 text-orange-300 border-orange-400/30';
      case 'Coaching': return 'bg-red-500/20 text-red-300 border-red-400/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
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
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/20">
      <div className="p-6 border-b border-white/20">
        <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
          <Clock className="w-5 h-5 text-blue-400" />
          <span>Today's Timeline</span>
        </h2>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400/50 via-purple-400/50 to-blue-400/50"></div>

        <div className="space-y-0">
          {tasks.map((task, index) => {
            const isCurrent = isTaskCurrent(task);
            const isCompleted = task.completed;
            
            return (
              <div
                key={task.id}
                className={`relative flex items-start space-x-4 p-6 transition-all duration-200 ${
                  isCurrent ? 'bg-blue-500/10 backdrop-blur-sm' : ''
                } ${index !== tasks.length - 1 ? 'border-b border-white/10' : ''}`}
              >
                {/* Timeline dot */}
                <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 shadow-lg ${
                  isCurrent 
                    ? 'bg-blue-500 border-blue-400 scale-110 shadow-blue-500/50' 
                    : isCompleted 
                      ? 'bg-green-500 border-green-400 shadow-green-500/50' 
                      : 'bg-white/10 backdrop-blur-sm border-white/30'
                }`}>
                  {isCompleted ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : isCurrent ? (
                    <Clock className="w-5 h-5 text-white animate-pulse" />
                  ) : (
                    <div className={`w-2 h-2 rounded-full ${
                      isCurrent ? 'bg-white' : 'bg-gray-400'
                    }`}></div>
                  )}
                </div>

                {/* Task content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className={`text-sm font-medium transition-colors ${
                        isCurrent ? 'text-blue-300' : 'text-white'
                      }`}>
                        {formatTime(task.time)}
                        {task.endTime && ` - ${formatTime(task.endTime)}`}
                      </span>
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm border ${getTagColor(task.tag)}`}>
                        {getTagIcon(task.tag)}
                        <span>{task.tag}</span>
                      </span>
                    </div>
                    
                    <button
                      onClick={() => onToggleTask(task.id, task.completed)}
                      className={`flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                        isCompleted
                          ? 'bg-green-500 border-green-400 shadow-green-500/50'
                          : 'border-white/30 hover:border-green-400 backdrop-blur-sm'
                      }`}
                    >
                      {isCompleted && <Check className="w-3 h-3 text-white" />}
                    </button>
                  </div>
                  
                  <p className={`text-sm leading-relaxed transition-colors ${
                    isCompleted 
                      ? 'text-gray-400 line-through' 
                      : isCurrent 
                        ? 'text-blue-200 font-medium'
                        : 'text-gray-200'
                  }`}>
                    {task.content}
                  </p>
                  
                  {isCurrent && (
                    <div className="mt-2 inline-flex items-center space-x-1 text-xs text-blue-300 font-medium">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
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