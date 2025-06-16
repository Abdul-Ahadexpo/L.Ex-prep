import React, { useState } from 'react';
import { X, Plus, Clock, FileText, Tag } from 'lucide-react';
import { useData } from '../contexts/DataContext';

interface ManualRoutineFormProps {
  onClose: () => void;
  onSave: () => void;
}

const ManualRoutineForm: React.FC<ManualRoutineFormProps> = ({ onClose, onSave }) => {
  const { addTask } = useData();
  const [formData, setFormData] = useState({
    subject: '',
    startTime: '',
    endTime: '',
    notes: '',
    tag: 'Study'
  });
  const [loading, setLoading] = useState(false);

  const tags = ['Study', 'School', 'Chat', 'Break', 'Coaching', 'Other'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.startTime) return;

    setLoading(true);
    try {
      const task = {
        time: formData.startTime,
        endTime: formData.endTime || undefined,
        content: formData.notes ? `${formData.subject} - ${formData.notes}` : formData.subject,
        tag: formData.tag,
        completed: false,
        date: new Date().toISOString().split('T')[0]
      };

      await addTask(task);
      onSave();
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="bg-green-500 p-2 rounded-lg">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Add Routine Manually
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Subject/Task Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Subject/Task Name *
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              placeholder="e.g., Mathematics Study Session"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          {/* Time Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Start Time *</span>
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>End Time</span>
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Tag Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-1">
              <Tag className="w-4 h-4" />
              <span>Category</span>
            </label>
            <select
              value={formData.tag}
              onChange={(e) => handleInputChange('tag', e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              {tags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-1">
              <FileText className="w-4 h-4" />
              <span>Notes (Optional)</span>
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional details, reminders, or instructions..."
              rows={3}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
            />
          </div>

          {/* Preview */}
          {formData.subject && formData.startTime && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 space-y-2">
              <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
                <Clock className="w-4 h-4" />
                <span className="font-medium text-sm">Preview</span>
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                <div className="font-medium">
                  {formData.startTime}{formData.endTime && ` - ${formData.endTime}`}
                </div>
                <div>{formData.subject}</div>
                {formData.notes && <div className="text-xs opacity-75">{formData.notes}</div>}
                <div className="inline-flex items-center space-x-1 px-2 py-1 bg-green-100 dark:bg-green-800 rounded-full text-xs font-medium mt-1">
                  <span>{formData.tag}</span>
                </div>
              </div>
            </div>
          )}
        </form>

        <div className="flex space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!formData.subject || !formData.startTime || loading}
            className="flex-1 px-4 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-none flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Add to Timeline</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManualRoutineForm;