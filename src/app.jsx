// src/app.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated, clearCredentials } from './services/api';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import WorkoutsPage from './pages/WorkoutsPage';
import ProgressPage from './pages/ProgressPage';
import SettingsPage from './pages/SettingsPage';

function Private({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={
            isAuthenticated() ? <Navigate to="/" replace /> : <LoginPage />
          }
        />

        {/* Protected */}
        <Route
          path="/"
          element={
            <Private>
              <Layout onLogout={() => { clearCredentials(); window.location.reload(); }}>
                <WorkoutsPage />
              </Layout>
            </Private>
          }
        />
        <Route
          path="/stats/*"
          element={
            <Private>
              <Layout onLogout={() => { clearCredentials(); window.location.reload(); }}>
                <ProgressPage />
              </Layout>
            </Private>
          }
        />
        <Route
          path="/schedule"
          element={
            <Private>
              <Layout onLogout={() => { clearCredentials(); window.location.reload(); }}>
                <SettingsPage />
              </Layout>
            </Private>
          }
        />

        {/* Catch-all */}
        <Route
          path="*"
          element={
            isAuthenticated() ? <Navigate to="/" replace /> : <Navigate to="/login" replace />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
