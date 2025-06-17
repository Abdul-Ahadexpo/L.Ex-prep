import React, { useState } from 'react';
import { Cloud, HardDrive, X, Upload } from 'lucide-react';
import { useData } from '../contexts/DataContext';

interface DataSyncPromptProps {
  onClose: () => void;
}

const DataSyncPrompt: React.FC<DataSyncPromptProps> = ({ onClose }) => {
  const { syncLocalToCloud, hasLocalData } = useData();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await syncLocalToCloud();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync data');
    } finally {
      setLoading(false);
    }
  };

  if (!hasLocalData) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <Cloud className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Sync Local Data
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <HardDrive className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Local data found!
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                You have routine data saved on this device
              </p>
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Would you like to sync your previous local data to your account? This will upload all your saved routines to the cloud and switch to cloud storage.
          </p>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Skip
            </button>
            <button
              onClick={handleSync}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-none flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Sync to Cloud</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSyncPrompt;