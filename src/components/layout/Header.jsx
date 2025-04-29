// src/components/layout/Header.jsx
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWorkout } from '../../context/WorkoutContext';
import { clearCredentials } from '../../services/api';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { error, clearError } = useWorkout();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [title, setTitle] = useState('');
  
  // Listen for scroll events
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const handleLogout = () => {
    // Clear auth token
    sessionStorage.removeItem('auth');
    
    // If in SettingsPage, use the prop
    if (setIsLoggedIn) {
      setIsLoggedIn(false);
    }
    
    // Navigate to login
    window.location.href = '/login';
  };
  
  
  // Set page title based on route
  useEffect(() => {
    switch (location.pathname) {
      case '/':
        setTitle('Dashboard');
        break;
      case '/workouts':
        setTitle('Workouts');
        break;
      case '/schedule':
        setTitle('Schedule');
        break;
      case '/progress':
        setTitle('Progress');
        break;
      case '/settings':
        setTitle('Settings');
        break;
      default:
        setTitle('WorkoutTracker');
    }
  }, [location]);
  
  return (
    <header className={`bg-white dark:bg-gray-800 fixed top-0 left-0 right-0 z-30 transition-shadow ${
      scrolled ? 'shadow-md' : 'shadow-sm'
    }`}>
      <div className="max-w-xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex flex-1 items-center">
            <Link to="/" className="flex items-center mr-4">
              <svg 
                className="h-8 w-8 text-blue-600" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 10V3L4 14h7v7l9-11h-7z" 
                />
              </svg>
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
                WorkoutTracker
              </span>
            </Link>
            
            <h1 className="text-lg font-medium text-gray-900 dark:text-white truncate">
              {title}
            </h1>
          </div>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              to="/" 
              className={`text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/' ? 'text-blue-600 dark:text-blue-400' : ''
              }`}
            >
              Dashboard
            </Link>
            <Link 
              to="/workouts" 
              className={`text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/workouts' ? 'text-blue-600 dark:text-blue-400' : ''
              }`}
            >
              Workouts
            </Link>
            <Link 
              to="/schedule" 
              className={`text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/schedule' ? 'text-blue-600 dark:text-blue-400' : ''
              }`}
            >
              Schedule
            </Link>
            <Link 
              to="/progress" 
              className={`text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/progress' ? 'text-blue-600 dark:text-blue-400' : ''
              }`}
            >
              Progress
            </Link>
          </nav>
          
          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-colors"
              aria-expanded="false"
            >
              <span className="sr-only">Open menu</span>
              {isMobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white dark:bg-gray-800 shadow-lg transform transition-transform"
               onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-4 py-5 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <svg 
                  className="h-8 w-8 text-blue-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M13 10V3L4 14h7v7l9-11h-7z" 
                  />
                </svg>
                <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                  WorkoutTracker
                </span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              >
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="pt-2 pb-3 px-4 space-y-1">
              <Link
                to="/"
                className={`block px-4 py-3 rounded-lg text-base font-medium ${
                  location.pathname === '/' 
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-100' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <svg className="mr-3 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Dashboard
                </div>
              </Link>
              <Link
                to="/workouts"
                className={`block px-4 py-3 rounded-lg text-base font-medium ${
                  location.pathname === '/workouts' 
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-100' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <svg className="mr-3 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Workouts
                </div>
              </Link>
              <Link
                to="/schedule"
                className={`block px-4 py-3 rounded-lg text-base font-medium ${
                  location.pathname === '/schedule' 
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-100' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <svg className="mr-3 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Schedule
                </div>
              </Link>
              <Link
                to="/progress"
                className={`block px-4 py-3 rounded-lg text-base font-medium ${
                  location.pathname === '/progress' 
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-100' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <svg className="mr-3 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Progress
                </div>
              </Link>
              <Link
                to="/settings"
                className={`block px-4 py-3 rounded-lg text-base font-medium ${
                  location.pathname === '/settings' 
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-100' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <svg className="mr-3 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </div>
              </Link>
              <Link>
              <button
  onClick={handleLogout}
  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
>
  Sign Out
</button>
              </Link>
            </div>
          </div>
        </div>
      )}
      
      {/* Error banner */}
      {error && (
        <div className="bg-red-600">
          <div className="max-w-xl mx-auto py-3 px-3">
            <div className="flex items-center justify-between flex-wrap">
              <div className="w-0 flex-1 flex items-center">
                <p className="ml-3 font-medium text-white truncate text-sm">
                  <span>{error}</span>
                </p>
              </div>
              <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-3">
                <button
                  type="button"
                  className="flex p-2 rounded-md hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-white"
                  onClick={clearError}
                >
                  <span className="sr-only">Dismiss</span>
                  <svg
                    className="h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}