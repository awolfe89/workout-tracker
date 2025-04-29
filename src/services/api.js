// API base URL - change this to match your backend server
const API_URL = 'http://localhost:5001/api';

// Authentication state
let credentials = null;

// Authentication functions
export const setCredentials = (username, password) => {
  credentials = {
    username,
    password
  };
  
  // Store in sessionStorage for persistence during page refreshes
  sessionStorage.setItem('auth', btoa(`${username}:${password}`));
};

export const clearCredentials = () => {
  credentials = null;
  sessionStorage.removeItem('auth');
};

export const isAuthenticated = () => {
  return credentials !== null || sessionStorage.getItem('auth') !== null;
};

// Get authentication header
const getAuthHeader = () => {
  if (credentials) {
    return `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`;
  }
  
  const storedAuth = sessionStorage.getItem('auth');
  if (storedAuth) {
    return `Basic ${storedAuth}`;
  }
  
  return null;
};

// Generic fetch wrapper with error handling
// api.js (simplified version)
// Just update the fetchApi function

// Update the fetchApi function in your api.js

async function fetchApi(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  
  // Create new headers object
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Always check for and add auth token
  try {
    const authToken = sessionStorage.getItem('auth');
    console.log(`Auth token for ${endpoint}:`, authToken ? 'Present' : 'Missing');
    
    if (authToken) {
      headers['Authorization'] = `Basic ${authToken}`;
    }
  } catch (e) {
    console.error('Error accessing sessionStorage:', e);
  }
  
  try {
    // Log request details for debugging
    console.log(`Making request to ${endpoint} with Authorization header:`, 
                headers.Authorization ? 'Present' : 'Missing');
    
    const response = await fetch(url, { ...options, headers });
    
    // Handle 401 Unauthorized
    if (response.status === 401) {
      console.error(`Unauthorized access to ${endpoint}`);
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('login')) {
        console.log('Redirecting to login page due to 401');
        window.location.href = '/login';
      }
      
      throw new Error('Unauthorized: Please log in');
    }
    
    // Check if the response is ok (status 200-299)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      const error = new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }
    
    // Parse response
    const contentType = response.headers.get('Content-Type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return await response.text();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Workout API endpoints
export const workoutApi = {
  // Get all workouts
  getAll: async () => {
    return await fetchApi('/workouts');
  },
  
  // Get workout by ID
  getById: async (id) => {
    return await fetchApi(`/workouts/${id}`);
  },
  
  // Create workout
  create: async (workoutData) => {
    return await fetchApi('/workouts', {
      method: 'POST',
      body: JSON.stringify(workoutData),
    });
  },
  
  // Update workout
  update: async (id, workoutData) => {
    return await fetchApi(`/workouts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(workoutData),
    });
  },
  
  // Delete workout
  delete: async (id) => {
    return await fetchApi(`/workouts/${id}`, {
      method: 'DELETE',
    });
  },
  
  // Delete all workouts
  deleteAll: async () => {
    return await fetchApi('/workouts/all', {
      method: 'DELETE',
    });
  },
};

// Schedule API endpoints
export const scheduleApi = {
  // Get schedule
  get: async () => {
    return await fetchApi('/schedule');
  },
  
  // Update schedule
  update: async (scheduleData) => {
    return await fetchApi('/schedule', {
      method: 'PUT',
      body: JSON.stringify(scheduleData),
    });
  },
  
  // Update specific day in schedule
  updateDay: async (day, workouts) => {
    return await fetchApi(`/schedule/${day}`, {
      method: 'PUT',
      body: JSON.stringify({ workouts }),
    });
  },
  
  // Delete all schedule data
  deleteAll: async () => {
    return await fetchApi('/schedule/all', {
      method: 'DELETE',
    });
  },
};

// Performance API endpoints
export const performanceApi = {
  // Get all performances
  getAll: async () => {
    return await fetchApi('/performance');
  },
  
  // Get performance by ID
  getById: async (id) => {
    return await fetchApi(`/performance/${id}`);
  },
  
  // Get performances by workout ID
  getByWorkoutId: async (workoutId) => {
    return await fetchApi(`/performance/workout/${workoutId}`);
  },
  
  // Create performance
  create: async (performanceData) => {
    return await fetchApi('/performance', {
      method: 'POST',
      body: JSON.stringify(performanceData),
    });
  },
  
  // Update performance
  update: async (id, performanceData) => {
    return await fetchApi(`/performance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(performanceData),
    });
  },
  
  // Delete performance
  delete: async (id) => {
    return await fetchApi(`/performance/${id}`, {
      method: 'DELETE',
    });
  },
  
  // Get exercise stats
  getExerciseStats: async (exerciseName) => {
    return await fetchApi(`/performance/stats/exercise/${exerciseName}`);
  },
  
  // Get total stats
  getTotalStats: async () => {
    return await fetchApi('/performance/stats/totals');
  },
  
  // Delete all performance data
  deleteAll: async () => {
    return await fetchApi('/performance/all', {
      method: 'DELETE',
    });
  },
};

// Auth API
export const authApi = {
  // Verify credentials
  verify: async () => {
    return await fetchApi('/auth/verify');
  },
};

// Utils API for operations affecting multiple collections
export const utilsApi = {
  // Clear all data
  clearAllData: async () => {
    return await fetchApi('/utils/clear-all-data', {
      method: 'DELETE',
    });
  },
};