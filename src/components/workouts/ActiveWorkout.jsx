// src/components/workouts/ActiveWorkout.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { performanceApi } from '../../services/api';

export default function ActiveWorkout({ workout, onComplete }) {
  const navigate = useNavigate();
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [performance, setPerformance] = useState({
    workoutId: workout._id,
    exercises: workout.exercises.map(ex => ({
      exerciseName: ex.name,
      sets: Array.from({ length: ex.sets }, (_, i) => ({
        setNumber: i + 1,
        weight: ex.weight,
        reps: ex.reps,
        notes: ''
      }))
    })),
    duration: 0,
    notes: ''
  });
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const [showRest, setShowRest] = useState(false);
  const [restTime, setRestTime] = useState(60); // Default rest time in seconds
  const [swipeStartX, setSwipeStartX] = useState(null);

  // Timer effect
  useEffect(() => {
    let interval = null;
    
    if (isActive) {
      interval = setInterval(() => {
        setTimer(seconds => seconds + 1);
      }, 1000);
    } else if (!isActive && timer !== 0) {
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [isActive, timer]);

  // Rest timer effect
  useEffect(() => {
    let interval = null;
    
    if (showRest && restTime > 0) {
      interval = setInterval(() => {
        setRestTime(time => time - 1);
      }, 1000);
    } else if (showRest && restTime === 0) {
      setShowRest(false);
      // Play sound or vibration when rest is over
      if (navigator.vibrate) {
        navigator.vibrate(200);
      }
      toast.success('Rest complete! Continue with your workout.');
    }
    
    return () => clearInterval(interval);
  }, [showRest, restTime]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startWorkout = () => {
    setIsActive(true);
    toast.success('Workout started!');
  };

  const pauseWorkout = () => {
    setIsActive(false);
    toast.success('Workout paused');
  };

  const updateSetValue = (exerciseIndex, setIndex, field, value) => {
    setPerformance(prev => {
      const updatedExercises = [...prev.exercises];
      updatedExercises[exerciseIndex] = {
        ...updatedExercises[exerciseIndex],
        sets: updatedExercises[exerciseIndex].sets.map((set, idx) => {
          if (idx === setIndex) {
            return { ...set, [field]: field === 'notes' ? value : Number(value) };
          }
          return set;
        })
      };
      return { ...prev, exercises: updatedExercises };
    });
  };

  const moveToNextSet = () => {
    const currentExercise = performance.exercises[currentExerciseIndex];
    const isLastSet = currentSetIndex === currentExercise.sets.length - 1;
    
    if (isLastSet) {
      // Move to next exercise
      const isLastExercise = currentExerciseIndex === performance.exercises.length - 1;
      
      if (isLastExercise) {
        // End of workout
        toast.success('All exercises completed!');
      } else {
        // Move to next exercise, first set
        setCurrentExerciseIndex(currentExerciseIndex + 1);
        setCurrentSetIndex(0);
        // Show rest timer before starting next exercise
        setRestTime(90); // Longer rest between exercises
        setShowRest(true);
      }
    } else {
      // Move to next set
      setCurrentSetIndex(currentSetIndex + 1);
      // Show rest timer between sets
      setRestTime(60);
      setShowRest(true);
    }
  };

  const moveToPreviousSet = () => {
    if (currentSetIndex > 0) {
      setCurrentSetIndex(currentSetIndex - 1);
    } else if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
      const prevExercise = performance.exercises[currentExerciseIndex - 1];
      setCurrentSetIndex(prevExercise.sets.length - 1);
    }
  };

  const handleTouchStart = (e) => {
    setSwipeStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (!swipeStartX) return;
    
    const endX = e.changedTouches[0].clientX;
    const diff = swipeStartX - endX;
    
    // Threshold for swipe
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swipe left - Next
        moveToNextSet();
      } else {
        // Swipe right - Previous
        moveToPreviousSet();
      }
    }
    
    setSwipeStartX(null);
  };

  const finishWorkout = async () => {
    setIsActive(false);
    setLoading(true);
    
    try {
      const finalPerformance = {
        ...performance,
        duration: timer,
        notes: notes
      };
      
      await performanceApi.create(finalPerformance);
      toast.success('Workout completed and saved!');
      
      if (onComplete) {
        onComplete();
      } else {
        navigate('/progress');
      }
    } catch (error) {
      console.error('Error saving workout performance:', error);
      toast.error('Failed to save workout performance');
    } finally {
      setLoading(false);
    }
  };

  const handleExitConfirm = () => {
    setConfirmExit(true);
  };

  const currentExercise = performance.exercises[currentExerciseIndex];
  const currentSet = currentExercise?.sets[currentSetIndex];
  const isLastSet = currentSetIndex === currentExercise?.sets.length - 1;
  const isLastExercise = currentExerciseIndex === performance.exercises.length - 1;

  // Show rest timer overlay
  if (showRest) {
    return (
      <div className="flex flex-col items-center justify-center h-screen fixed inset-0 bg-black bg-opacity-80 z-50 p-6">
        <div className="text-white text-center">
          <h2 className="text-3xl font-bold mb-8">Rest Time</h2>
          <div className="text-6xl font-mono mb-8">{formatTime(restTime)}</div>
          <p className="mb-8 text-gray-300">
            {restTime > 45 ? 'Take a deep breath and prepare for the next exercise' : 'Get ready for the next set'}
          </p>
          <div className="flex gap-4">
            <button 
              onClick={() => setShowRest(false)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium shadow-lg hover:bg-blue-700 transition-colors"
            >
              Skip Rest
            </button>
            <button 
              onClick={() => setRestTime(restTime + 30)}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg font-medium shadow-lg hover:bg-gray-600 transition-colors"
            >
              +30s
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Confirm exit dialog
  if (confirmExit) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-sm w-full">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Exit Workout?
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Your workout progress will be lost if you exit now. Are you sure?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setConfirmExit(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onComplete) onComplete();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium"
              >
                Exit Workout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sticky top-16 z-10 bg-gray-50 dark:bg-gray-900 py-2">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate mr-2">
            {workout.name}
          </h2>
          <div className="text-xl font-mono bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-md">
            {formatTime(timer)}
          </div>
        </div>
      </div>
      
      {!isActive ? (
        <div className="bg-blue-50 dark:bg-blue-900 p-6 rounded-lg shadow-sm mb-6 text-center">
          <svg className="h-16 w-16 text-blue-600 dark:text-blue-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-blue-800 dark:text-blue-200 text-lg mb-6">
            Ready to start your workout? Let's go!
          </p>
          <button 
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={startWorkout}
          >
            Start Workout
          </button>
        </div>
      ) : (
        <div 
          className="space-y-6" 
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="relative h-1 bg-gray-200 dark:bg-gray-700">
              <div 
                className="absolute h-1 bg-blue-600 dark:bg-blue-500 transition-all duration-300 ease-out"
                style={{ 
                  width: `${((currentExerciseIndex * 100) / performance.exercises.length) + 
                          ((currentSetIndex * 100) / (performance.exercises.length * currentExercise.sets.length))}%` 
                }}
              ></div>
            </div>
            
            <div className="p-5">
              <div className="flex justify-between items-center mb-5">
                <div>
                  <div className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium inline-flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Exercise {currentExerciseIndex + 1}/{performance.exercises.length}
                  </div>
                </div>
                <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 px-3 py-1 rounded-full text-sm font-medium">
                  Set {currentSetIndex + 1}/{currentExercise?.sets.length}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-5">
                {currentExercise?.exerciseName}
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="label">Weight (lbs)</label>
                  <div className="relative mt-1">
                    <button
                      onClick={() => {
                        const newValue = Math.max(0, (currentSet?.weight || 0) - 5);
                        updateSetValue(currentExerciseIndex, currentSetIndex, 'weight', newValue);
                      }}
                      className="absolute inset-y-0 left-0 px-3 bg-gray-100 dark:bg-gray-700 rounded-l-md flex items-center"
                    >
                      <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <input
                      type="number"
                      value={currentSet?.weight === 0 ? "" : currentSet?.weight}
                      onChange={(e) => updateSetValue(
                        currentExerciseIndex, 
                        currentSetIndex, 
                        'weight', 
                        e.target.value === "" ? 0 : e.target.value
                      )}
                      min="0"
                      step="5"
                      className="input text-center h-12 text-lg font-medium"
                      inputMode="decimal"
                    />
                    <button
                      onClick={() => {
                        const newValue = (currentSet?.weight || 0) + 5;
                        updateSetValue(currentExerciseIndex, currentSetIndex, 'weight', newValue);
                      }}
                      className="absolute inset-y-0 right-0 px-3 bg-gray-100 dark:bg-gray-700 rounded-r-md flex items-center"
                    >
                      <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="label">Reps</label>
                  <div className="relative mt-1">
                    <button
                      onClick={() => {
                        const newValue = Math.max(1, (currentSet?.reps || 1) - 1);
                        updateSetValue(currentExerciseIndex, currentSetIndex, 'reps', newValue);
                      }}
                      className="absolute inset-y-0 left-0 px-3 bg-gray-100 dark:bg-gray-700 rounded-l-md flex items-center"
                    >
                      <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <input
                      type="number"
                      value={currentSet?.reps}
                      onChange={(e) => updateSetValue(
                        currentExerciseIndex, 
                        currentSetIndex, 
                        'reps', 
                        e.target.value
                      )}
                      min="1"
                      className="input text-center h-12 text-lg font-medium"
                      inputMode="numeric"
                    />
                    <button
                      onClick={() => {
                        const newValue = (currentSet?.reps || 0) + 1;
                        updateSetValue(currentExerciseIndex, currentSetIndex, 'reps', newValue);
                      }}
                      className="absolute inset-y-0 right-0 px-3 bg-gray-100 dark:bg-gray-700 rounded-r-md flex items-center"
                    >
                      <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="col-span-2">
                  <label className="label">Notes</label>
                  <input
                    type="text"
                    value={currentSet?.notes}
                    onChange={(e) => updateSetValue(
                      currentExerciseIndex, 
                      currentSetIndex, 
                      'notes', 
                      e.target.value
                    )}
                    placeholder="How did this set feel?"
                    className="input"
                  />
                </div>
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={moveToPreviousSet}
                  disabled={currentExerciseIndex === 0 && currentSetIndex === 0}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentExerciseIndex === 0 && currentSetIndex === 0
                      ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Prev
                </button>
                
                {isLastExercise && isLastSet ? (
                  <button
                    onClick={finishWorkout}
                    className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-sm transition-colors"
                  >
                    <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Finish
                  </button>
                ) : (
                  <button
                    onClick={moveToNextSet}
                    className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors"
                  >
                    Next
                    <svg className="w-5 h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
              
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                Swipe left for next set, right for previous
              </p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Workout Progress
            </h3>
            
            <div className="space-y-4">
              {performance.exercises.map((exercise, exIndex) => (
                <div key={exIndex} className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-3 last:pb-0">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      {exIndex < currentExerciseIndex ? (
                        <svg className="w-5 h-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : exIndex === currentExerciseIndex ? (
                        <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      <h4 className="font-medium text-gray-800 dark:text-gray-200 truncate">
                        {exercise.exerciseName}
                      </h4>
                    </div>
                    <span className={`text-xs font-medium ${
                      exIndex < currentExerciseIndex 
                        ? 'text-green-600 dark:text-green-400' 
                        : exIndex === currentExerciseIndex 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      {exIndex < currentExerciseIndex 
                        ? 'Complete' 
                        : exIndex === currentExerciseIndex 
                          ? 'In Progress' 
                          : 'Upcoming'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-5 gap-1">
                    {exercise.sets.map((set, setIndex) => (
                      <div 
                        key={setIndex}
                        className={`h-1.5 rounded-full ${
                          exIndex < currentExerciseIndex 
                            ? 'bg-green-500' 
                            : exIndex === currentExerciseIndex && setIndex < currentSetIndex
                              ? 'bg-green-500'
                              : exIndex === currentExerciseIndex && setIndex === currentSetIndex
                                ? 'bg-blue-500'
                                : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="fixed bottom-16 inset-x-0 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-20">
            <div className="flex justify-between max-w-xl mx-auto">
              {isActive ? (
                <button
                  onClick={pauseWorkout}
                  className="flex-1 mr-2 flex items-center justify-center py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Pause
                </button>
              ) : (
                <button
                  onClick={startWorkout}
                  className="flex-1 mr-2 flex items-center justify-center py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  </svg>
                  Resume
                </button>
              )}
              
              <button
                onClick={handleExitConfirm}
                className="flex-1 ml-2 flex items-center justify-center py-3 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-800 dark:text-red-200 font-medium rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}