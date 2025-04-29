// src/components/layouts/Header.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useWorkout } from '../../context/WorkoutContext';
import { clearCredentials } from '../../services/api';

export default function Header({ onLogout }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { error, clearError } = useWorkout();
  const location = useLocation();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');

  // Update title based on route
  useEffect(() => {
    switch (location.pathname) {
      case '/':
        setTitle('Workouts');
        break;
      case '/stats':
        setTitle('Progress');
        break;
      case '/schedule':
        setTitle('Schedule');
        break;
      case '/settings':
        setTitle('Settings');
        break;
      default:
        setTitle('Workout Tracker');
    }
    // Close mobile menu on route change
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    clearCredentials();
    onLogout();              // flips App's isLoggedIn
    navigate('/login', { replace: true });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-20 bg-white shadow dark:bg-gray-800">
      <div className="max-w-4xl mx-auto flex items-center justify-between px-4 h-16">
        <h1 className="text-xl font-semibold dark:text-white">{title}</h1>

        {/* Desktop nav */}
        <nav className="hidden md:flex space-x-6">
          <Link to="/" className={`hover:text-blue-500 ${location.pathname === '/' ? 'text-blue-600 font-medium' : ''}`}>
            Workouts
          </Link>
          <Link to="/stats" className={`hover:text-blue-500 ${location.pathname === '/stats' ? 'text-blue-600 font-medium' : ''}`}>
            Progress
          </Link>
          <Link to="/schedule" className={`hover:text-blue-500 ${location.pathname === '/schedule' ? 'text-blue-600 font-medium' : ''}`}>
            Schedule
          </Link>
          <Link to="/settings" className={`hover:text-blue-500 ${location.pathname === '/settings' ? 'text-blue-600 font-medium' : ''}`}>
            Settings
          </Link>
          <button
            onClick={handleLogout}
            className="text-red-600 hover:text-red-800"
          >
            Sign Out
          </button>
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsMobileMenuOpen(v => !v)}
          className="md:hidden p-2 rounded text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t shadow dark:bg-gray-800 dark:border-gray-700">
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${location.pathname === '/' ? 'text-blue-600 font-medium' : ''}`}
          >
            Workouts
          </Link>
          <Link
            to="/stats"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${location.pathname === '/stats' ? 'text-blue-600 font-medium' : ''}`}
          >
            Progress
          </Link>
          <Link
            to="/schedule"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${location.pathname === '/schedule' ? 'text-blue-600 font-medium' : ''}`}
          >
            Schedule
          </Link>
          <Link
            to="/settings"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${location.pathname === '/settings' ? 'text-blue-600 font-medium' : ''}`}
          >
            Settings
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Sign Out
          </button>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="fixed top-16 left-0 right-0 z-10 bg-red-100 text-red-800 px-4 py-2">
          <div className="max-w-4xl mx-auto flex justify-between items-start">
            <span>{error}</span>
            <button onClick={clearError} className="ml-4 text-sm">Dismiss</button>
          </div>
        </div>
      )}
    </header>
  );
}