// src/hooks/useLocalStorage.js
import { useState, useEffect } from 'react';

/**
 * Custom hook for managing state with localStorage
 * @param {string} key - The localStorage key
 * @param {any} initialValue - Initial value if no value exists in localStorage
 * @returns {Array} [storedValue, setValue] - State value and setter
 */
export function useLocalStorage(key, initialValue) {
  // Get value from localStorage or use initialValue
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      // Parse stored json or return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when state changes
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

// src/hooks/useToast.js
import { useCallback } from 'react';
import { toast } from 'react-hot-toast';

/**
 * Custom hook for consistent toast notifications
 * @returns {Object} Toast notification methods
 */
export function useToast() {
  const success = useCallback((message) => {
    toast.success(message, {
      duration: 3000,
      position: 'top-right',
    });
  }, []);

  const error = useCallback((message) => {
    toast.error(message, {
      duration: 4000,
      position: 'top-right',
    });
  }, []);

  const info = useCallback((message) => {
    toast(message, {
      duration: 3000,
      position: 'top-right',
    });
  }, []);

  const confirm = useCallback((message, onConfirm, onCancel) => {
    toast((t) => (
      <div className="flex flex-col space-y-2">
        <p>{message}</p>
        <div className="flex space-x-2">
          <button
            className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            onClick={() => {
              onConfirm();
              toast.dismiss(t.id);
            }}
          >
            Confirm
          </button>
          <button
            className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            onClick={() => {
              if (onCancel) onCancel();
              toast.dismiss(t.id);
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: 10000,
      position: 'top-center',
    });
  }, []);

  return { success, error, info, confirm };
}

// src/hooks/useWorkouts.js
import { useContext } from 'react';
import { WorkoutContext } from '../context/WorkoutContext';

/**
 * Custom hook to access workout context
 * @returns {Object} Workout context
 */
export function useWorkouts() {
  const context = useContext(WorkoutContext);
  
  if (!context) {
    throw new Error('useWorkouts must be used within a WorkoutProvider');
  }
  
  return context;
}

// src/hooks/useDebounce.js
import { useState, useEffect } from 'react';

/**
 * Custom hook for debouncing a value
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {any} Debounced value
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Update debounced value after specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cancel the timeout if value changes or unmount
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// src/hooks/useMediaQuery.js
import { useState, useEffect } from 'react';

/**
 * Custom hook for responsive design with media queries
 * @param {string} query - Media query string
 * @returns {boolean} Whether the media query matches
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Update matches state initially and on change
    const updateMatches = () => {
      setMatches(media.matches);
    };
    
    // Set initial value
    updateMatches();
    
    // Add listener for changes
    media.addEventListener('change', updateMatches);
    
    // Cleanup
    return () => {
      media.removeEventListener('change', updateMatches);
    };
  }, [query]);

  return matches;
}