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

// — Core fetch wrapper
async function fetchApi(endpoint, options = {}) {
  const url = `${API_ROOT}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...options.headers };

  // Attach stored token, if any
  const token = localStorage.getItem('auth');
  if (token) headers['Authorization'] = `Basic ${token}`;

  try {
    console.log(`API Request: ${options.method || 'GET'} ${url}`);
    if (options.body) {
      console.log('Request payload:', JSON.parse(options.body));
    }
    
    const response = await fetch(url, { ...options, headers });
    
    console.log(`API Response: ${response.status} ${response.statusText}`);
    
    if (response.status === 401) {
      // Let the React layer handle redirects
      throw new Error('Unauthorized');
    }
    
    if (!response.ok) {
      const errText = await response.text().catch(() => 'No error details available');
      console.error('Error response:', errText);
      
      // Try to parse as JSON if possible
      let errBody;
      try {
        errBody = JSON.parse(errText);
      } catch (e) {
        errBody = { message: `Error ${response.status}` };
      }
      
      throw new Error(errBody.message || `Error ${response.status}`);
    }
    
    // Check content type
    const contentType = response.headers.get('Content-Type') || '';
    
    // Parse response based on content type
    if (contentType.includes('application/json')) {
      return response.json();
    } else {
      return response.text();
    }
  } catch (error) {
    console.error('API call failed:', error);
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
export const dateWorkoutApi = {
  getByDate: (date) => fetchApi(`/dateworkouts/${date}`),
  getByDateRange: (startDate, endDate) => 
    fetchApi(`/dateworkouts/range?startDate=${startDate}&endDate=${endDate}`),
  updateByDate: (date, workouts) => 
    fetchApi(`/dateworkouts/${date}`, { 
      method: 'PUT', 
      body: JSON.stringify({ workouts }) 
    })
};

export const scheduleApi = {
  get: () => fetchApi('/schedule'),
  update: async (data) => {
    // Validate data structure
    if (!data || !data.days || !Array.isArray(data.days)) {
      console.error('Invalid schedule data structure:', data);
      throw new Error('Invalid schedule data structure');
    }
    
    // Ensure each day has the required properties
    const validatedDays = data.days.map(day => {
      // Ensure workouts is an array
      if (!Array.isArray(day.workouts)) {
        day.workouts = [];
      }
      
      return {
        day: day.day,
        workouts: day.workouts.map(workout => ({
          workoutId: workout.workoutId,
          name: workout.name,
          type: workout.type || 'unknown',
          duration: workout.duration || 0
        }))
      };
    });
    
    
    // Make a simplified update request
    return fetchApi('/schedule', { 
      method: 'PUT', 
      body: JSON.stringify({ days: validatedDays })
    });
  },

  
  // Keep this method for reference, but we're not using it directly now
  updateDay: (day, workouts) => {
    if (!day || !Array.isArray(workouts)) {
      console.error('Invalid day or workouts:', { day, workouts });
      return Promise.reject(new Error('Invalid day or workouts'));
    }
    
    return fetchApi(`/schedule/${day}`, { 
      method: 'PUT', 
      body: JSON.stringify({ workouts }) 
    });
  },
};

export const performanceApi = {
  getAll: () => fetchApi('/performance'),
  getByWorkout: (workoutId) => fetchApi(`/performance/workout/${workoutId}`),
  getById: (id) => fetchApi(`/performance/${id}`),
  create: (data) => fetchApi('/performance', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => fetchApi(`/performance/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => fetchApi(`/performance/${id}`, { method: 'DELETE' }),
  getExerciseStats: (exerciseName) => fetchApi(`/performance/stats/exercise/${exerciseName}`),
  getTotalStats: () => fetchApi('/performance/stats/totals'),
};