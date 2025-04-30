// src/components/layout/Layout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import BottomNavigation from './BottomNavigation';
import { useWorkout } from '../../context/WorkoutContext';
import toast from 'react-hot-toast';

export default function Layout({ children, onLogout }) {
  const location = useLocation();
  const { error, clearError } = useWorkout();
  const [showError, setShowError] = useState(false);
  
  // Handle error display
  useEffect(() => {
    if (error) {
      setShowError(true);
      // Auto-hide error after 5 seconds
      const timer = setTimeout(() => {
        setShowError(false);
        clearError();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);
  
  // Dismiss error message
  const dismissError = () => {
    setShowError(false);
    clearError();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header onLogout={onLogout} />
      
      {/* Error banner */}
      {showError && error && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-red-100 text-red-800 px-4 py-2">
          <div className="max-w-4xl mx-auto flex justify-between items-start">
            <span>{error}</span>
            <button onClick={dismissError} className="ml-4 text-sm">Dismiss</button>
          </div>
        </div>
      )}
      
      <main className="flex-grow px-4 max-w-4xl mx-auto w-full">
        <div className="pt-24 pb-24">
          {/* Use children prop for component-based routing */}
          {children}
          
          {/* Support for React Router's Outlet */}
          <Outlet />
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
}