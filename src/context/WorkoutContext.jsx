import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { performanceApi, workoutApi } from '../services/api';

// Create the context
const WorkoutContext = createContext();

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

  // Fetch all workouts
  const fetchWorkouts = async () => {
    try {
      const data = await workoutApi.getAll();
      setWorkouts(data);
    } catch (err) {
      if (err.message.startsWith('Unauthorized')) {
        sessionStorage.removeItem('auth');
        navigate('/login', { replace: true });
      } else {
        console.error('Error fetching workouts:', err);
      }
    }
  };

  // Fetch all performance records
  const fetchPerformances = async () => {
    try {
      const data = await performanceApi.getAll();
      setPerformances(data);
    } catch (err) {
      if (err.message.startsWith('Unauthorized')) {
        sessionStorage.removeItem('auth');
        navigate('/login', { replace: true });
      } else {
        console.error('Error fetching performances:', err);
      }
    }
  };

  // Add a new workout
  const addWorkout = async (workout) => {
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
      }
      throw err;
    }
  };

  // Finish the active workout and refresh performances
  const finishWorkout = () => {
    setActiveWorkout(null);
    fetchPerformances();
  };

  // On mount, load initial data
  useEffect(() => {
    fetchWorkouts();
    fetchPerformances();
  }, []);

  const value = {
    workouts,
    performances,
    activeWorkout,
    setActiveWorkout,
    addWorkout,
    fetchWorkouts,
    fetchPerformances,
    finishWorkout
  };

  return (
    <WorkoutContext.Provider value={value}>
      {children}
    </WorkoutContext.Provider>
  );
}