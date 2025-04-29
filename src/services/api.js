// src/services/api.js

// Base URL from Vite environment variables
const API_URL = '/api';

// Authentication utilities
export const setCredentials = (username, password) => {
  const token = btoa(`${username}:${password}`);
  sessionStorage.setItem('auth', token);
};

export const clearCredentials = () => {
  sessionStorage.removeItem('auth');
};

export const isAuthenticated = () => {
  return sessionStorage.getItem('auth') !== null;
};

// Generic fetch wrapper with authentication and error handling
async function fetchApi(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Attach auth header if present
  const authToken = sessionStorage.getItem('auth');
  if (authToken) {
    headers['Authorization'] = `Basic ${authToken}`;
  }

  const response = await fetch(url, { ...options, headers });

  // Handle unauthorized
  if (response.status === 401) {
    if (!window.location.pathname.includes('login')) {
      window.location.href = '/login';
    }
    throw new Error('Unauthorized: Please log in');
  }

  // Handle other errors
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
  }

  // Parse JSON or text
  const contentType = response.headers.get('Content-Type');
  if (contentType?.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

// Workout API endpoints
export const workoutApi = {
  getAll: () => fetchApi('/workouts'),
  getById: (id) => fetchApi(`/workouts/${id}`),
  create: (workoutData) => fetchApi('/workouts', { method: 'POST', body: JSON.stringify(workoutData) }),
  update: (id, workoutData) => fetchApi(`/workouts/${id}`, { method: 'PUT', body: JSON.stringify(workoutData) }),
  delete: (id) => fetchApi(`/workouts/${id}`, { method: 'DELETE' }),
  deleteAll: () => fetchApi('/workouts/all', { method: 'DELETE' }),
};

// Schedule API endpoints
export const scheduleApi = {
  get: () => fetchApi('/schedule'),
  update: (scheduleData) => fetchApi('/schedule', { method: 'PUT', body: JSON.stringify(scheduleData) }),
  updateDay: (day, workouts) => fetchApi(`/schedule/${day}`, { method: 'PUT', body: JSON.stringify({ workouts }) }),
  deleteAll: () => fetchApi('/schedule/all', { method: 'DELETE' }),
};

// Performance API endpoints
export const performanceApi = {
  getAll: () => fetchApi('/performance'),
  getById: (id) => fetchApi(`/performance/${id}`),
  getByWorkoutId: (workoutId) => fetchApi(`/performance/workout/${workoutId}`),
  create: (performanceData) => fetchApi('/performance', { method: 'POST', body: JSON.stringify(performanceData) }),
  update: (id, performanceData) => fetchApi(`/performance/${id}`, { method: 'PUT', body: JSON.stringify(performanceData) }),
  delete: (id) => fetchApi(`/performance/${id}`, { method: 'DELETE' }),
  getExerciseStats: (exerciseName) => fetchApi(`/performance/stats/exercise/${exerciseName}`),
  getTotalStats: () => fetchApi('/performance/stats/totals'),
  deleteAll: () => fetchApi('/performance/all', { method: 'DELETE' }),
};

// Auth API
export const authApi = {
  verify: () => fetchApi('/auth/verify'),
};

// Utils API
export const utilsApi = {
  clearAllData: () => fetchApi('/utils/clear-all-data', { method: 'DELETE' }),
};
