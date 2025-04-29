import React, { useState, useEffect, useContext } from 'react';
import { WorkoutContext } from '../context/WorkoutContext';
import { performanceApi } from '../services/api';
import toast from 'react-hot-toast';

export default function ActiveWorkout() {
  const { activeWorkout, finishWorkout } = useContext(WorkoutContext);
  const { id, name, exercises = [] } = activeWorkout || {};

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
    setIsActive(false);
    try {
      await performanceApi.create({ workoutId: id, duration: timer });
      toast.success('Workout saved!');
      finishWorkout();
    } catch (error) {
      toast.error('Failed to save workout.');
    }
  };

  const handleRest = (seconds) => {
    setRestTime(seconds);
    setShowRest(true);
  };

  if (!activeWorkout) {
    return <p className="text-center py-8">No active workout selected.</p>;
  }

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Active Workout: {name}</h2>
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

      <div className="text-lg">Duration: <strong>{timer}s</strong></div>

      <div className="grid gap-4">
        {exercises.map((ex) => (
          <div key={ex.id} className="card p-4">
            <h3 className="font-semibold">{ex.name}</h3>
            <p>Sets: {ex.sets} × Reps: {ex.reps}</p>
            <button
              type="button"
              onClick={() => handleRest(ex.rest || 30)}
              className="btn btn-secondary btn-sm mt-2"
            >
              Rest {ex.rest || 30}s
            </button>
          </div>
        ))}
      </div>

      {showRest && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg text-center">
            <p className="text-xl">Rest</p>
            <p className="text-5xl font-bold my-4">{restTime}s</p>
          </div>
        </div>
      )}
    </div>
  );
}