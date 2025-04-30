// src/pages/SettingsPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearCredentials } from '../services/api';
import { toast } from 'react-hot-toast';
import { useTheme } from '../components/layout/ThemeProvider'; // If you have this component

export default function SettingsPage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme || { theme: 'light', setTheme: () => {} };
  
  const handleLogout = () => {
    clearCredentials();
    toast.success('Logged out successfully');
    navigate('/login', { replace: true });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
      </div>
      
      <div className="card p-6">
        <h2 className="text-lg font-medium mb-4">Application Settings</h2>
        
        <div className="space-y-4">
          {/* Theme toggle - if you have ThemeProvider */}
          <div className="flex justify-between items-center">
            <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`px-3 py-1 rounded-md ${
                theme === 'dark' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {theme === 'dark' ? 'On' : 'Off'}
            </button>
          </div>
          
          {/* Other settings can go here */}
          
          {/* Logout button */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}