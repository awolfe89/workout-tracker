import React, { useState, useEffect } from 'react';
import { useWorkout } from '../../context/WorkoutContext';
import { performanceApi } from '../../services/api';
import { toast } from 'react-hot-toast';

export default function ActiveWorkout({ onComplete }) {
  // Use the custom hook to access workout context
  const { activeWorkout, finishWorkout } = useWorkout();

  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [restTime, setRestTime] = useState(30);
  const [showRest, setShowRest] = useState(false);

  // Workout duration timer
  useEffect(() => {
    let interval;
    if (isActive) {
      interval = setInterval(() => {
        setTimer((sec) => sec + 1);
      }, 1000);
    }
    return () => interval && clearInterval(interval);
  }, [isActive]);

  // Rest countdown timer
  useEffect(() => {
    let interval;
    if (showRest) {
      interval = setInterval(() => {
        setRestTime((time) => time - 1);
      }, 1000);
    }
    return () => interval && clearInterval(interval);
  }, [showRest]);

  // Notify when rest finishes
  useEffect(() => {
    if (showRest && restTime === 0) {
      setShowRest(false);
      if (navigator.vibrate) navigator.vibrate(200);
      toast.success('Rest complete! Resume your workout.');
    }
  }, [restTime, showRest]);

  const startWorkout = () => {
    setTimer(0);
    setIsActive(true);
  };

  const finishAndSave = async () => {
    if (!activeWorkout || !activeWorkout._id) {
      toast.error('No active workout to save');
      return;
    }

    setIsActive(false);
    try {
      await performanceApi.create({ 
        workoutId: activeWorkout._id, 
        duration: timer,
        exercises: activeWorkout.exercises.map(ex => ({
          exerciseName: ex.name,
          sets: [{ setNumber: 1, weight: ex.weight || 0, reps: ex.reps || 0 }]
        }))
      });
      toast.success('Workout saved!');
      finishWorkout();
      if (onComplete) onComplete();
    } catch (error) {
      console.error('Error saving workout:', error);
      toast.error('Failed to save workout.');
    }
  };

  const handleRest = (seconds) => {
    setRestTime(seconds);
    setShowRest(true);
  };

  if (!activeWorkout) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">No active workout selected.</p>
        <button 
          onClick={onComplete} 
          className="mt-4 btn btn-primary"
        >
          Back to Workouts
        </button>
      </div>
    );
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Active Workout: {activeWorkout.name}</h2>
        {isActive ? (
          <button onClick={finishAndSave} className="btn btn-danger">
            Finish Workout
          </button>
        ) : (
          <button onClick={startWorkout} className="btn btn-primary">
            Start Workout
          </button>
        )}
      </header>

      <div className="text-lg">Duration: <strong>{formatTime(timer)}</strong></div>

      <div className="grid gap-4">
        {activeWorkout.exercises.map((ex, index) => (
          <div key={index} className="card p-4">
            <h3 className="font-semibold">{ex.name}</h3>
            <p>Sets: {ex.sets} × Reps: {ex.reps}</p>
            <p>Weight: {ex.weight} lbs</p>
            <button
              type="button"
              onClick={() => handleRest(ex.rest || 30)}
              className="btn btn-secondary mt-2"
            >
              Rest {ex.rest || 30}s
            </button>
          </div>
        ))}
      </div>

      {showRest && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg text-center">
            <p className="text-xl">Rest</p>
            <p className="text-5xl font-bold my-4">{restTime}s</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowRest(false)}
            >
              Skip
            </button>
          </div>
        </div>
      )}
    </div>
  );
}