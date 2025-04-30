// src/app.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import WorkoutsPage from './pages/WorkoutsPage';
import ProgressPage from './pages/ProgressPage';
import SchedulePage from './pages/SchedulePage';
import SettingsPage from './pages/SettingsPage';
import { WorkoutProvider } from './context/WorkoutContext';
import { authApi, clearCredentials } from './services/api';

// Loading component for auth state checking
const LoadingScreen = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
);

function App() {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isLoading: true,
  });
  const navigate = useNavigate();

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      // Check if we have a token in localStorage
      const token = localStorage.getItem('auth');
      
      if (!token) {
        setAuthState({ isAuthenticated: false, isLoading: false });
        return;
      }

      try {
        // Verify token with server
        await authApi.verify();
        setAuthState({ isAuthenticated: true, isLoading: false });
      } catch (error) {
        // Clear invalid token
        clearCredentials();
        setAuthState({ isAuthenticated: false, isLoading: false });
      }
    };

    checkAuth();
  }, []);

  // Handle logout
  const handleLogout = () => {
    clearCredentials();
    setAuthState({ isAuthenticated: false, isLoading: false });
    navigate('/login', { replace: true });
  };

  // Show loading screen while checking auth
  if (authState.isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        {/* Public route */}
        <Route
          path="/login"
          element={
            authState.isAuthenticated ? 
              <Navigate to="/" replace /> : 
              <LoginPage onLoginSuccess={() => setAuthState({ isAuthenticated: true, isLoading: false })} />
          }
        />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            authState.isAuthenticated ? (
              <WorkoutProvider>
                <Layout onLogout={handleLogout}>
                  <WorkoutsPage />
                </Layout>
              </WorkoutProvider>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/stats/*"
          element={
            authState.isAuthenticated ? (
              <WorkoutProvider>
                <Layout onLogout={handleLogout}>
                  <ProgressPage />
                </Layout>
              </WorkoutProvider>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/schedule"
          element={
            authState.isAuthenticated ? (
              <WorkoutProvider>
                <Layout onLogout={handleLogout}>
                  <SchedulePage />
                </Layout>
              </WorkoutProvider>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/settings"
          element={
            authState.isAuthenticated ? (
              <WorkoutProvider>
                <Layout onLogout={handleLogout}>
                  <SettingsPage />
                </Layout>
              </WorkoutProvider>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Catch-all route */}
        <Route
          path="*"
          element={
            <Navigate to={authState.isAuthenticated ? "/" : "/login"} replace />
          }
        />
      </Routes>
    </>
  );
}

export default App;