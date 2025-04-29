 // src/pages/SettingsPage.jsx
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function SettingsPage() {
  const [theme, setTheme] = useState(() => {
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  
  const [units, setUnits] = useState(() => {
    return localStorage.getItem('units') || 'metric';
  });
  
  // Effect to apply theme whenever it changes
  useEffect(() => {
    localStorage.setItem('theme', theme);
    
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme]);
  
  // Listen for system theme changes when theme is set to 'system'
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e) => {
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      };
      
      // Modern way to add listener that works in all browsers
      mediaQuery.addEventListener('change', handleChange);
      
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }
  }, [theme]);
  
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Apply theme to document immediately
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (newTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    
    toast.success(`Theme changed to ${newTheme}`);
  };
  
  const handleUnitsChange = (newUnits) => {
    setUnits(newUnits);
    localStorage.setItem('units', newUnits);
    toast.success(`Units changed to ${newUnits}`);
  };
  
  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all workout data? This action cannot be undone.')) {
      // Don't remove theme and units settings when clearing workout data
      const themeValue = localStorage.getItem('theme');
      const unitsValue = localStorage.getItem('units');
      
      localStorage.clear();
      
      // Restore theme and units settings
      localStorage.setItem('theme', themeValue);
      localStorage.setItem('units', unitsValue);
      
      toast.success('All workout data has been cleared');
      window.location.reload();
    }
  };
  
  return (
    <div className="space-y-8 pt-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-8">
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Appearance
          </h2>
          
          <div className="space-y-4">
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Theme
              </span>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => handleThemeChange('light')}
                  className={`flex-1 min-w-[80px] py-3 px-4 rounded-md border ${
                    theme === 'light'
                      ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <svg className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Light
                  </div>
                </button>
                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`flex-1 min-w-[80px] py-3 px-4 rounded-md border ${
                    theme === 'dark'
                      ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <svg className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                    Dark
                  </div>
                </button>
                <button
                  onClick={() => handleThemeChange('system')}
                  className={`flex-1 min-w-[80px] py-3 px-4 rounded-md border ${
                    theme === 'system'
                      ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <svg className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    System
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Units
          </h2>
          
          <div className="space-y-4">
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Measurement System
              </span>
              <div className="mt-2 flex space-x-3">
                <button
                  onClick={() => handleUnitsChange('metric')}
                  className={`flex-1 py-3 px-4 rounded-md border ${
                    units === 'metric'
                      ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Metric (kg)
                </button>
                <button
                  onClick={() => handleUnitsChange('imperial')}
                  className={`flex-1 py-3 px-4 rounded-md border ${
                    units === 'imperial'
                      ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Imperial (lbs)
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Data Management
          </h2>
          
          <div className="space-y-4">
            <div>
              <button
                onClick={handleClearData}
                className="py-3 px-4 w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Clear All Workout Data
              </button>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                This will permanently delete all your workouts and schedule data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}