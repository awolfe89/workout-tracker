// src/context/WorkoutContext.jsx

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { workoutApi, scheduleApi } from '../services/api';

export const ACTIONS = {
  SET_WORKOUTS: 'set_workouts',
  ADD_WORKOUT: 'add_workout',
  UPDATE_WORKOUT: 'update_workout',
  DELETE_WORKOUT: 'delete_workout',
  SET_SCHEDULE: 'set_schedule',
  UPDATE_SCHEDULE: 'update_schedule',
  SET_LOADING: 'set_loading',
  SET_ERROR: 'set_error',
  CLEAR_ERROR: 'clear_error',
};

const initialState = {
  workouts: [],
  schedule: [],
  loading: false,
  error: null,
};

function workoutReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_WORKOUTS:
      return { ...state, workouts: action.payload, loading: false };
    case ACTIONS.ADD_WORKOUT:
      return { ...state, workouts: [...state.workouts, action.payload], loading: false };
    case ACTIONS.UPDATE_WORKOUT:
      return {
        ...state,
        workouts: state.workouts.map((w) =>
          w._id === action.payload._id ? action.payload : w
        ),
        loading: false,
      };
    case ACTIONS.DELETE_WORKOUT:
      return { ...state, workouts: state.workouts.filter((w) => w._id !== action.payload), loading: false };
    case ACTIONS.SET_SCHEDULE:
      return { ...state, schedule: action.payload, loading: false };
    case ACTIONS.UPDATE_SCHEDULE:
      return { ...state, schedule: action.payload, loading: false };
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
}

const WorkoutContext = createContext();

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
};

export function WorkoutProvider({ children }) {
  const [state, dispatch] = useReducer(workoutReducer, initialState);

  useEffect(() => {
    const token = sessionStorage.getItem('auth');
    if (!token) return;

    const fetchWorkouts = async () => {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      try {
        const workouts = await workoutApi.getAll();
        dispatch({ type: ACTIONS.SET_WORKOUTS, payload: workouts });
      } catch (error) {
        console.error('Error fetching workouts:', error);
        dispatch({
          type: ACTIONS.SET_ERROR,
          payload: 'Failed to load workout data. Please refresh the page.',
        });
      }
    };

    const fetchSchedule = async () => {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      try {
        const schedule = await scheduleApi.get();
        const scheduleDays = schedule.days || [];
        dispatch({ type: ACTIONS.SET_SCHEDULE, payload: scheduleDays });
      } catch (error) {
        console.error('Error fetching schedule:', error);
        dispatch({
          type: ACTIONS.SET_ERROR,
          payload: 'Failed to load schedule data. Please refresh the page.',
        });
      }
    };

    fetchWorkouts();
    fetchSchedule();
  }, []);

  // CRUD operations
  const addWorkout = async (workout) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    try {
      const newWorkout = await workoutApi.create(workout);
      dispatch({ type: ACTIONS.ADD_WORKOUT, payload: newWorkout });
      return newWorkout;
    } catch (error) {
      console.error('Error adding workout:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Failed to add workout. Please try again.' });
      throw error;
    }
  };

  const updateWorkout = async (id, updatedData) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    try {
      const updatedWorkout = await workoutApi.update(id, updatedData);
      dispatch({ type: ACTIONS.UPDATE_WORKOUT, payload: updatedWorkout });
      return updatedWorkout;
    } catch (error) {
      console.error('Error updating workout:', error);
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: 'Failed to update workout. Please try again.',
      });
      throw error;
    }
  };

  const deleteWorkout = async (id) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    try {
      await workoutApi.delete(id);
      dispatch({ type: ACTIONS.DELETE_WORKOUT, payload: id });
    } catch (error) {
      console.error('Error deleting workout:', error);
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: 'Failed to delete workout. Please try again.',
      });
      throw error;
    }
  };

  const getWorkout = (id) => state.workouts.find((w) => w._id === id);
  const getAllWorkouts = () => state.workouts;

  const updateSchedule = async (newSchedule) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    try {
      const result = await scheduleApi.update({ days: newSchedule });
      const updatedDays = result.days || [];
      dispatch({ type: ACTIONS.UPDATE_SCHEDULE, payload: updatedDays });
      return updatedDays;
    } catch (error) {
      console.error('Error updating schedule:', error);
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: 'Failed to update workout schedule. Please try again.',
      });
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: ACTIONS.CLEAR_ERROR });
  };

  const value = {
    ...state,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    getWorkout,
    getAllWorkouts,
    updateSchedule,
    clearError,
  };

  return <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>;
}
