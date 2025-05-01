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
  
  // Track completed sets for each exercise
  const [exerciseProgress, setExerciseProgress] = useState({});
  // Track completed exercises
  const [completedExercises, setCompletedExercises] = useState({});

  // Initialize exercise progress when activeWorkout changes
  useEffect(() => {
    if (activeWorkout && activeWorkout.exercises) {
      const initialProgress = {};
      const initialCompleted = {};
      
      activeWorkout.exercises.forEach((exercise, index) => {
        const exerciseId = `exercise-${index}`;
        initialProgress[exerciseId] = Array(exercise.sets).fill(false);
        initialCompleted[exerciseId] = false;
      });
      
      setExerciseProgress(initialProgress);
      setCompletedExercises(initialCompleted);
    }
  }, [activeWorkout]);

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
    
    // Gather completed sets data for performance tracking
    const completedExercisesData = activeWorkout.exercises.map((exercise, index) => {
      const exerciseId = `exercise-${index}`;
      const completedSets = exerciseProgress[exerciseId] || Array(exercise.sets).fill(false);
      const isExerciseCompleted = completedExercises[exerciseId] || false;
      
      // Create sets data for each set (completed or not)
      const sets = completedSets.map((completed, setIndex) => {
        return {
          setNumber: setIndex + 1,
          weight: exercise.weight || 0,
          reps: exercise.reps || 0,
          completed: completed // Track whether this set was completed
        };
      });
      
      return {
        exerciseName: exercise.name,
        sets,
        totalSets: exercise.sets,
        completedSets: completedSets.filter(Boolean).length,
        completed: isExerciseCompleted
      };
    });
    
    try {
      await performanceApi.create({ 
        workoutId: activeWorkout._id, 
        duration: timer,
        exercises: completedExercisesData,
        // Add completion metadata
        completionStats: {
          totalExercises: activeWorkout.exercises.length,
          completedExercises: Object.values(completedExercises).filter(Boolean).length,
          allExercisesCompleted: Object.values(completedExercises).every(Boolean)
        }
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
  
  const toggleSetCompletion = (exerciseId, setIndex) => {
    setExerciseProgress(prev => {
      const updatedSets = [...prev[exerciseId]];
      updatedSets[setIndex] = !updatedSets[setIndex];
      
      return {
        ...prev,
        [exerciseId]: updatedSets
      };
    });
  };
  
  const markExerciseComplete = (exerciseId) => {
    setCompletedExercises(prev => ({
      ...prev,
      [exerciseId]: !prev[exerciseId]
    }));
  };
  
  // Check if all sets are completed
  const areAllSetsCompleted = (exerciseId) => {
    return exerciseProgress[exerciseId] && 
           exerciseProgress[exerciseId].every(set => set === true);
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

      <div className="text-lg bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        Duration: <strong>{formatTime(timer)}</strong>
      </div>

      <div className="grid gap-4">
        {activeWorkout.exercises.map((ex, index) => {
          const exerciseId = `exercise-${index}`;
          const isCompleted = completedExercises[exerciseId];
          
          return (
            <div 
              key={index} 
              className={`card p-4 transition-all ${isCompleted ? 'opacity-60' : ''}`}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-lg">{ex.name}</h3>
                <button
                  type="button"
                  onClick={() => isActive && markExerciseComplete(exerciseId)}
                  disabled={!isActive}
                  className={`text-sm px-3 py-1 rounded-full ${
                    !isActive 
                      ? 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed' :
                      isCompleted 
                        ? 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400' 
                        : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  }`}
                >
                  {isCompleted ? 'Completed' : 'Mark Complete'}
                </button>
              </div>
              
              <div className="mb-3">
                <p className="text-gray-600 dark:text-gray-400">
                  {ex.sets} sets × {ex.reps} reps • {ex.weight} lbs
                </p>
              </div>
              
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Sets Completed:
                </label>
                <div className="flex flex-wrap gap-2">
                  {exerciseProgress[exerciseId] && 
                    exerciseProgress[exerciseId].map((completed, setIndex) => (
                    <label 
                      key={setIndex}
                      className={`flex items-center ${isActive ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'} 
                        bg-white dark:bg-gray-700 p-2 rounded-md border border-gray-200 dark:border-gray-600`}
                    >
                      <input
                        type="checkbox"
                        checked={completed}
                        onChange={() => isActive && toggleSetCompletion(exerciseId, setIndex)}
                        disabled={!isActive}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded
                          disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <span className="ml-2 text-sm">Set {setIndex + 1}</span>
                    </label>
                  ))}
                </div>
                {!isActive && (
                  <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
                    Start the workout to track sets
                  </p>
                )}
              </div>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleRest(ex.rest || 30)}
                  className={`btn btn-secondary text-sm ${!isActive && 'opacity-50 cursor-not-allowed'}`}
                  disabled={!isActive}
                >
                  Rest {ex.rest || 30}s
                </button>
                
                {!isCompleted && areAllSetsCompleted(exerciseId) && isActive && (
                  <button
                    type="button"
                    onClick={() => markExerciseComplete(exerciseId)}
                    className="btn btn-primary text-sm"
                  >
                    Complete Exercise
                  </button>
                )}
              </div>
            </div>
          );
        })}
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