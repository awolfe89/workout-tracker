import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { performanceApi, workoutApi, scheduleApi } from '../services/api';
import { isAuthenticated, clearCredentials } from '../services/api';
import { toast } from 'react-hot-toast';

// Create the context
export const WorkoutContext = createContext();

// Custom hook for consuming context
export function useWorkout() {
  return useContext(WorkoutContext);
}

// Provider component
export function WorkoutProvider({ children }) {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState([]);
  const [performances, setPerformances] = useState([]);
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [schedule, setSchedule] = useState({ days: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Clear error
  const clearError = () => setError(null);

  // Fetch all workouts
  const fetchWorkouts = async () => {
    setLoading(true);
    try {
      const data = await workoutApi.getAll();
      setWorkouts(data);
      return data;
    } catch (err) {
      handleApiError(err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch schedule
  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const data = await scheduleApi.get();
      console.log('Fetched schedule:', data);
      setSchedule(data);
      return data;
    } catch (err) {
      handleApiError(err);
      return { days: [] };
    } finally {
      setLoading(false);
    }
  };

  // Fetch all performance records
  const fetchPerformances = async () => {
    setLoading(true);
    try {
      const data = await performanceApi.getAll();
      setPerformances(data);
      return data;
    } catch (err) {
      handleApiError(err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Add a new workout
  const addWorkout = async (workout) => {
    setLoading(true);
    try {
      const saved = await workoutApi.create(workout);
      setWorkouts(prev => [...prev, saved]);
      toast.success('Workout created successfully');
      return saved;
    } catch (err) {
      handleApiError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update a workout
  const updateWorkout = async (id, workoutData) => {
    setLoading(true);
    try {
      const updated = await workoutApi.update(id, workoutData);
      setWorkouts(prev => prev.map(w => w._id === id ? updated : w));
      toast.success('Workout updated successfully');
      return updated;
    } catch (err) {
      handleApiError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a workout
  const deleteWorkout = async (id) => {
    setLoading(true);
    try {
      await workoutApi.delete(id);
      setWorkouts(prev => prev.filter(w => w._id !== id));
      toast.success('Workout deleted successfully');
      return true;
    } catch (err) {
      handleApiError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update schedule
  const updateSchedule = async (scheduleData) => {
    setLoading(true);
    try {
      const updated = await scheduleApi.update(scheduleData);
      setSchedule(updated);
      toast.success('Schedule updated successfully');
      return updated;
    } catch (err) {
      handleApiError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Handle API errors
  const handleApiError = (err) => {
    console.error('API error:', err);
    
    if (err.message && err.message.startsWith('Unauthorized')) {
      clearCredentials();
      navigate('/login', { replace: true });
    } else {
      setError(`Error: ${err.message || 'Unknown error'}`);
      toast.error(err.message || 'An error occurred');
    }
  };

  // Get all workouts (used in the WorkoutCalendar component)
  const getAllWorkouts = () => {
    return workouts;
  };

  // Finish the active workout and refresh performances
  const finishWorkout = () => {
    setActiveWorkout(null);
    fetchPerformances();
  };

  // Load initial data on mount
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { replace: true });
      return;
    }
    
    const loadAllData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchWorkouts(),
          fetchSchedule(),
          fetchPerformances()
        ]);
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadAllData();
  }, [navigate]);

  const value = {
    workouts,
    performances,
    activeWorkout,
    schedule,
    loading,
    error,
    setActiveWorkout,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    fetchWorkouts,
    fetchPerformances,
    fetchSchedule,
    updateSchedule,
    finishWorkout,
    clearError,
    getAllWorkouts
  };

  return (
    <WorkoutContext.Provider value={value}>
      {children}
    </WorkoutContext.Provider>
  );
}