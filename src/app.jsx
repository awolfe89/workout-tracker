// src/app.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { WorkoutProvider } from './context/WorkoutContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import WorkoutsPage from './pages/WorkoutsPage';
import SchedulePage from './pages/SchedulePage';
import ProgressPage from './pages/ProgressPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import { Toaster } from 'react-hot-toast';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const hasAuth = sessionStorage.getItem('auth') !== null;
    console.log('App initialized, auth token:', hasAuth ? 'Present' : 'Missing');
    return hasAuth;
  });
  
  const [initialLoading, setInitialLoading] = useState(true);
  
  // Initial loading simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle login success
  const handleLoginSuccess = () => {
    console.log('Login successful, updating app state');
    setIsLoggedIn(true);
  };
  
  // Handle logout
  const handleLogout = () => {
    console.log('Logging out, clearing auth');
    sessionStorage.removeItem('auth');
    setIsLoggedIn(false);
  };

  
  
  // Show loading spinner during initial load
  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <Router>
      <WorkoutProvider>
        <Toaster position="top-right" />
        <Routes>
          {/* Login route */}
          <Route 
            path="/login" 
            element={
              isLoggedIn ? 
                <Navigate to="/" replace /> : 
                <LoginPage onLoginSuccess={handleLoginSuccess} />
            } 
          />
          
          {/* Protected routes */}
          <Route 
            path="/" 
            element={
              isLoggedIn ? 
                <Layout onLogout={handleLogout}>
                  <Dashboard />
                </Layout> : 
                <Navigate to="/login" replace />
            } 
          />
          
          <Route 
            path="/workouts" 
            element={
              isLoggedIn ? 
                <Layout onLogout={handleLogout}>
                  <WorkoutsPage />
                </Layout> : 
                <Navigate to="/login" replace />
            } 
          />
          
          <Route 
            path="/schedule" 
            element={
              isLoggedIn ? 
                <Layout onLogout={handleLogout}>
                  <SchedulePage />
                </Layout> : 
                <Navigate to="/login" replace />
            } 
          />
          
          <Route 
            path="/progress" 
            element={
              isLoggedIn ? 
                <Layout onLogout={handleLogout}>
                  <ProgressPage />
                </Layout> : 
                <Navigate to="/login" replace />
            } 
          />
          
          <Route 
            path="/settings" 
            element={
              isLoggedIn ? 
                <Layout onLogout={handleLogout}>
                  <SettingsPage />
                </Layout> : 
                <Navigate to="/login" replace />
            } 
          />
          
          {/* Catch-all route */}
          <Route 
            path="*" 
            element={<Navigate to={isLoggedIn ? "/" : "/login"} replace />} 
          />
        </Routes>
      </WorkoutProvider>
    </Router>
  );
}

export default App;