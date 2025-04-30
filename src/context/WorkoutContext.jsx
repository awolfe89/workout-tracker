// src/context/WorkoutContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { workoutApi, performanceApi, clearCredentials } from '../services/api';

// Create the context
export const WorkoutContext = createContext();

// Custom hook for consuming the context
export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
}

// Provider component
export function WorkoutProvider({ children }) {
  const navigate = useNavigate();
  
  // State variables
  const [workouts, setWorkouts] = useState([]);
  const [performances, setPerformances] = useState([]);
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Fetch all workouts
  const fetchWorkouts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await workoutApi.getAll();
      setWorkouts(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching workouts:', err);
      if (err.message.includes('Unauthorized')) {
        clearCredentials();
        navigate('/login', { replace: true });
      } else {
        setError('Failed to load workouts. Please try again.');
        toast.error('Could not load your workouts');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);
  
  // Fetch all performance records
  const fetchPerformances = useCallback(async () => {
    try {
      setLoading(true);
      const data = await performanceApi.getAll();
      setPerformances(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching performances:', err);
      if (err.message.includes('Unauthorized')) {
        clearCredentials();
        navigate('/login', { replace: true });
      } else {
        setError('Failed to load workout history. Please try again.');
        toast.error('Could not load your workout history');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);
  
  // Add a new workout
  const addWorkout = useCallback(async (workout) => {
    try {
      setLoading(true);
      const saved = await workoutApi.create(workout);
      setWorkouts(prev => [...prev, saved]);
      toast.success('Workout created successfully!');
      setError(null);
      return saved;
    } catch (err) {
      console.error('Error adding workout:', err);
      if (err.message.includes('Unauthorized')) {
        clearCredentials();
        navigate('/login', { replace: true });
      } else {
        setError('Failed to create workout. Please try again.');
        toast.error('Could not create workout');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [navigate]);
  
  // Update an existing workout
  const updateWorkout = useCallback(async (id, workout) => {
    try {
      setLoading(true);
      const updated = await workoutApi.update(id, workout);
      setWorkouts(prev => prev.map(w => w._id === id ? updated : w));
      toast.success('Workout updated successfully!');
      setError(null);
      return updated;
    } catch (err) {
      console.error('Error updating workout:', err);
      if (err.message.includes('Unauthorized')) {
        clearCredentials();
        navigate('/login', { replace: true });
      } else {
        setError('Failed to update workout. Please try again.');
        toast.error('Could not update workout');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [navigate]);
  
  // Delete a workout
  const deleteWorkout = useCallback(async (id) => {
    try {
      setLoading(true);
      await workoutApi.delete(id);
      setWorkouts(prev => prev.filter(w => w._id !== id));
      toast.success('Workout deleted successfully!');
      setError(null);
      return true;
    } catch (err) {
      console.error('Error deleting workout:', err);
      if (err.message.includes('Unauthorized')) {
        clearCredentials();
        navigate('/login', { replace: true });
      } else {
        setError('Failed to delete workout. Please try again.');
        toast.error('Could not delete workout');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Clear any error messages
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Finish the active workout
  const finishWorkout = useCallback(() => {
    setActiveWorkout(null);
    fetchPerformances();
  }, [fetchPerformances]);

  // Get all available workouts
  const getAllWorkouts = useCallback(() => {
    return workouts;
  }, [workouts]);

  // Load initial data on mount
  useEffect(() => {
    fetchWorkouts();
    fetchPerformances();
  }, [fetchWorkouts, fetchPerformances]);

  // Context value
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