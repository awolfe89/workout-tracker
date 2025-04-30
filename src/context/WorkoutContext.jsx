import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { performanceApi, workoutApi, scheduleApi } from '../services/api';
import { isAuthenticated } from '../services/api';

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
    } catch (err) {
      if (err.message.startsWith('Unauthorized')) {
        sessionStorage.removeItem('auth');
        navigate('/login', { replace: true });
      } else {
        console.error('Error fetching workouts:', err);
        setError('Failed to load workouts. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch schedule
  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const data = await scheduleApi.get();
      setSchedule(data);
    } catch (err) {
      if (err.message.startsWith('Unauthorized')) {
        sessionStorage.removeItem('auth');
        navigate('/login', { replace: true });
      } else {
        console.error('Error fetching schedule:', err);
        setError('Failed to load schedule. Please try again.');
      }
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
    } catch (err) {
      if (err.message.startsWith('Unauthorized')) {
        sessionStorage.removeItem('auth');
        navigate('/login', { replace: true });
      } else {
        console.error('Error fetching performances:', err);
        setError('Failed to load workout history. Please try again.');
      }
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
      return saved;
    } catch (err) {
      if (err.message.startsWith('Unauthorized')) {
        sessionStorage.removeItem('auth');
        navigate('/login', { replace: true });
      } else {
        console.error('Error adding workout:', err);
        setError('Failed to create workout. Please try again.');
      }
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
      return updated;
    } catch (err) {
      if (err.message.startsWith('Unauthorized')) {
        sessionStorage.removeItem('auth');
        navigate('/login', { replace: true });
      } else {
        console.error('Error updating workout:', err);
        setError('Failed to update workout. Please try again.');
      }
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
      return true;
    } catch (err) {
      if (err.message.startsWith('Unauthorized')) {
        sessionStorage.removeItem('auth');
        navigate('/login', { replace: true });
      } else {
        console.error('Error deleting workout:', err);
        setError('Failed to delete workout. Please try again.');
      }
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
      return updated;
    } catch (err) {
      if (err.message.startsWith('Unauthorized')) {
        sessionStorage.removeItem('auth');
        navigate('/login', { replace: true });
      } else {
        console.error('Error updating schedule:', err);
        setError('Failed to update schedule. Please try again.');
      }
      throw err;
    } finally {
      setLoading(false);
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

  // On mount, load initial data
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