import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { DataProvider } from './contexts/DataContext';
import Dashboard from './components/Dashboard';
import ParticleBackground from './components/ParticleBackground';

const AppContent: React.FC = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center relative">
        <ParticleBackground />
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 relative z-10"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <ParticleBackground />
      <div className="relative z-10">
        <Routes>
          <Route 
            path="/" 
            element={<Dashboard />} 
          />
          <Route 
            path="*" 
            element={<Navigate to="/" replace />} 
          />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <NotificationProvider>
          <Router>
            <div className="App">
              <AppContent />
            </div>
          </Router>
        </NotificationProvider>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;