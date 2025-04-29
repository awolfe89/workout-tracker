import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { WorkoutProvider } from './context/WorkoutContext';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import WorkoutsPage from './pages/WorkoutsPage';
import StatsPage from './pages/ProgressPage';
import SchedulePage from './pages/SchedulePage';
import SettingsPage from './pages/SettingsPage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => sessionStorage.getItem('auth') !== null
  );

  const handleLoginSuccess = () => setIsLoggedIn(true);
  const handleLogout = () => {
    sessionStorage.removeItem('auth');
    setIsLoggedIn(false);
  };

  return (
    <WorkoutProvider>
      <Routes>
        {/* Public route for login */}
        <Route
          path="/login"
          element={
            isLoggedIn
              ? <Navigate to="/" replace />
              : <LoginPage onLoginSuccess={handleLoginSuccess} />
          }
        />

        {/* Protected routes wrapped in Layout */}
        <Route element={<Layout onLogout={handleLogout} />}>
          <Route
            path="/"
            element={
              isLoggedIn
                ? <WorkoutsPage />
                : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/stats"
            element={
              isLoggedIn
                ? <StatsPage />
                : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/schedule"
            element={
              isLoggedIn
                ? <SchedulePage />
                : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/settings"
            element={
              isLoggedIn
                ? <SettingsPage />
                : <Navigate to="/login" replace />
            }
          />
        </Route>

        {/* Fallback route */}
        <Route
          path="*"
          element={<Navigate to={isLoggedIn ? "/" : "/login"} replace />}
        />
      </Routes>
    </WorkoutProvider>
  );
}

export default App;