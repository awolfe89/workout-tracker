// src/services/api.js

// Decide API root based on dev vs. prod
const isDev = import.meta.env.DEV;
const API_ROOT = isDev ? '/api' : '/.netlify/functions/api';

// — Auth helpers
export function setCredentials(username, password) {
  const token = btoa(`${username}:${password}`);
  localStorage.setItem('auth', token);
}

export function clearCredentials() {
  localStorage.removeItem('auth');
}

export function isAuthenticated() {
  return localStorage.getItem('auth') !== null;
}

// — Core fetch wrapper with improved error handling
async function fetchApi(endpoint, options = {}) {
  const url = `${API_ROOT}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...options.headers };

  // Attach stored token, if any
  const token = localStorage.getItem('auth');
  if (token) headers['Authorization'] = `Basic ${token}`;

  try {
    const response = await fetch(url, { ...options, headers });

    // Handle authentication errors consistently
    if (response.status === 401) {
      // Clear credentials on auth failure
      clearCredentials();
      throw new Error('Unauthorized: Please log in again');
    }
    
    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.message || `Error ${response.status}: ${response.statusText}`);
    }
    
    // Parse JSON response or return text
    if (response.headers.get('Content-Type')?.includes('json')) {
      return await response.json();
    } else {
      return await response.text();
    }
  } catch (error) {
    console.error(`API Error (${url}):`, error);
    throw error;
  }
}

// — Exposed APIs
export const authApi = {
  verify: () => fetchApi('/auth/verify'),
};

export const workoutApi = {
  getAll: () => fetchApi('/workouts'),
  getById: (id) => fetchApi(`/workouts/${id}`),
  create: (data) => fetchApi('/workouts', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => fetchApi(`/workouts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => fetchApi(`/workouts/${id}`, { method: 'DELETE' }),
};

export const scheduleApi = {
  get: () => fetchApi('/schedule'),
  update: (data) => fetchApi('/schedule', { method: 'PUT', body: JSON.stringify(data) }),
  updateDay: (day, data) => fetchApi(`/schedule/${day}`, { method: 'PUT', body: JSON.stringify(data) }),
};

export const performanceApi = {
  getAll: () => fetchApi('/performance'),
  getById: (id) => fetchApi(`/performance/${id}`),
  getByWorkout: (workoutId) => fetchApi(`/performance/workout/${workoutId}`),
  create: (data) => fetchApi('/performance', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => fetchApi(`/performance/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => fetchApi(`/performance/${id}`, { method: 'DELETE' }),
  getExerciseStats: (exerciseName) => fetchApi(`/performance/stats/exercise/${exerciseName}`),
  getTotalStats: () => fetchApi('/performance/stats/totals'),
};