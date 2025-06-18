import React, { useState, useRef } from 'react';
import { Download, Upload, Trash2, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useData } from '../contexts/DataContext';

interface DataManagerProps {
  onClose: () => void;
}

const DataManager: React.FC<DataManagerProps> = ({ onClose }) => {
  const { exportData, importData, clearLocalData, isGuestMode } = useData();
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      exportData();
      setMessage({ type: 'success', text: 'Data exported successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to export data' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setMessage(null);

    try {
      const text = await file.text();
      console.log('File content:', text);
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        throw new Error('Invalid JSON file format');
      }
      
      console.log('Parsed data:', data);
      
      await importData(data);
      setMessage({ type: 'success', text: `Successfully imported ${data.tasks?.length || 0} tasks!` });
      setTimeout(() => setMessage(null), 5000);
    } catch (error: any) {
      console.error('Import error:', error);
      const errorMessage = error.message || 'Failed to import data. Please check the file format.';
      setMessage({ type: 'error', text: errorMessage });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all local data? This action cannot be undone.')) {
      clearLocalData();
      setMessage({ type: 'success', text: 'Local data cleared successfully!' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Data Management
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {message && (
            <div className={`p-3 rounded-lg flex items-center space-x-2 ${
              message.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleExport}
              className="w-full flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-colors text-left"
            >
              <div className="bg-blue-500 p-2 rounded-lg">
                <Download className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Export Data</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Download your data as a JSON file
                </p>
              </div>
            </button>

            <button
              onClick={handleImportClick}
              disabled={importing}
              className="w-full flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-xl transition-colors text-left disabled:opacity-50"
            >
              <div className="bg-green-500 p-2 rounded-lg">
                {importing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Upload className="w-4 h-4 text-white" />
                )}
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Import Data</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {importing ? 'Importing...' : 'Upload a JSON backup file'}
                </p>
              </div>
            </button>

            {isGuestMode && (
              <button
                onClick={handleClearData}
                className="w-full flex items-center space-x-3 p-4 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-colors text-left"
              >
                <div className="bg-red-500 p-2 rounded-lg">
                  <Trash2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Clear Local Data</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Remove all data from this device
                  </p>
                </div>
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataManager;
