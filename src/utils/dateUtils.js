// src/utils/dateUtils.js
/**
 * Format a date string to a readable format
 * @param {string} dateString - ISO date string
 * @param {object} options - Format options
 * @returns {string} Formatted date string
 */
export function formatDate(dateString, options = {}) {
  const defaultOptions = {
    weekday: undefined,
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  
  const formatOptions = { ...defaultOptions, ...options };
  const date = new Date(dateString);
  
  return date.toLocaleDateString('en-US', formatOptions);
}

/**
 * Get the date for the start of the week (Sunday)
 * @param {Date} date - Date to get the start of the week for
 * @returns {Date} Start of the week
 */
export function getStartOfWeek(date = new Date()) {
  const result = new Date(date);
  const day = result.getDay();
  
  result.setDate(result.getDate() - day);
  result.setHours(0, 0, 0, 0);
  
  return result;
}

/**
 * Get the date for the end of the week (Saturday)
 * @param {Date} date - Date to get the end of the week for
 * @returns {Date} End of the week
 */
export function getEndOfWeek(date = new Date()) {
  const result = new Date(date);
  const day = result.getDay();
  
  result.setDate(result.getDate() + (6 - day));
  result.setHours(23, 59, 59, 999);
  
  return result;
}

/**
 * Get the date for the start of the month
 * @param {Date} date - Date to get the start of the month for
 * @returns {Date} Start of the month
 */
export function getStartOfMonth(date = new Date()) {
  const result = new Date(date);
  
  result.setDate(1);
  result.setHours(0, 0, 0, 0);
  
  return result;
}

/**
 * Get the date for the end of the month
 * @param {Date} date - Date to get the end of the month for
 * @returns {Date} End of the month
 */
export function getEndOfMonth(date = new Date()) {
  const result = new Date(date);
  
  result.setMonth(result.getMonth() + 1);
  result.setDate(0);
  result.setHours(23, 59, 59, 999);
  
  return result;
}

/**
 * Get an array of dates for the current week
 * @param {Date} date - Date in the week to get days for
 * @returns {Array<Date>} Array of dates for the week
 */
export function getDaysOfWeek(date = new Date()) {
  const start = getStartOfWeek(date);
  const days = [];
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(day.getDate() + i);
    days.push(day);
  }
  
  return days;
}

/**
 * Check if a date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if the date is today
 */
export function isToday(date) {
  const today = new Date();
  const checkDate = new Date(date);
  
  return checkDate.getDate() === today.getDate() &&
         checkDate.getMonth() === today.getMonth() &&
         checkDate.getFullYear() === today.getFullYear();
}

/**
 * Calculate the time difference between two dates in days
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {number} Difference in days
 */
export function getDaysDifference(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  // Reset time part for accurate day calculation
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  
  // Calculate difference in milliseconds and convert to days
  const diffTime = Math.abs(d2 - d1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

// src/utils/validationUtils.js
/**
 * Validate a workout object
 * @param {object} workout - Workout to validate
 * @returns {object} Validation result with errors
 */
export function validateWorkout(workout) {
  const errors = {};
  
  // Validate name
  if (!workout.name || workout.name.trim() === '') {
    errors.name = 'Workout name is required';
  }
  
  // Validate duration
  if (workout.duration === undefined || workout.duration === null) {
    errors.duration = 'Duration is required';
  } else if (isNaN(workout.duration) || workout.duration <= 0) {
    errors.duration = 'Duration must be a positive number';
  }
  
  // Validate type
  const validTypes = ['strength', 'cardio', 'hiit', 'flexibility', 'mixed'];
  if (!workout.type || !validTypes.includes(workout.type)) {
    errors.type = 'Please select a valid workout type';
  }
  
  // Validate exercises
  if (!workout.exercises || workout.exercises.length === 0) {
    errors.exercises = 'At least one exercise is required';
  } else {
    workout.exercises.forEach((exercise, index) => {
      // Validate exercise name
      if (!exercise.name || exercise.name.trim() === '') {
        errors[`exercise_${index}_name`] = 'Exercise name is required';
      }
      
      // Validate exercise sets
      if (exercise.sets === undefined || exercise.sets === null) {
        errors[`exercise_${index}_sets`] = 'Sets is required';
      } else if (isNaN(exercise.sets) || exercise.sets <= 0) {
        errors[`exercise_${index}_sets`] = 'Sets must be a positive number';
      }
      
      // Validate exercise reps
      if (exercise.reps === undefined || exercise.reps === null) {
        errors[`exercise_${index}_reps`] = 'Reps is required';
      } else if (isNaN(exercise.reps) || exercise.reps <= 0) {
        errors[`exercise_${index}_reps`] = 'Reps must be a positive number';
      }
      
      // Validate exercise weight (can be 0)
      if (exercise.weight === undefined || exercise.weight === null) {
        errors[`exercise_${index}_weight`] = 'Weight is required';
      } else if (isNaN(exercise.weight) || exercise.weight < 0) {
        errors[`exercise_${index}_weight`] = 'Weight must be a non-negative number';
      }
    });
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate schedule
 * @param {Array} schedule - Array of day schedules
 * @returns {object} Validation result with errors
 */
export function validateSchedule(schedule) {
  const errors = {};
  
  if (!Array.isArray(schedule)) {
    errors.schedule = 'Schedule must be an array';
    return { isValid: false, errors };
  }
  
  const validDays = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 
    'Thursday', 'Friday', 'Saturday'
  ];
  
  // Check if all required days are present
  const daySet = new Set(schedule.map(day => day.day));
  for (const day of validDays) {
    if (!daySet.has(day)) {
      errors.missingDays = `Missing schedule for ${day}`;
    }
  }
  
  // Validate each day
  schedule.forEach((day, index) => {
    if (!day.day || !validDays.includes(day.day)) {
      errors[`day_${index}`] = `Invalid day: ${day.day}`;
    }
    
    if (!Array.isArray(day.workouts)) {
      errors[`day_${index}_workouts`] = 'Workouts must be an array';
    } else {
      // Validate each workout
      day.workouts.forEach((workout, workoutIndex) => {
        if (!workout.id) {
          errors[`day_${index}_workout_${workoutIndex}_id`] = 'Workout ID is required';
        }
        if (!workout.name) {
          errors[`day_${index}_workout_${workoutIndex}_name`] = 'Workout name is required';
        }
      });
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate exercise data
 * @param {object} exercise - Exercise to validate
 * @returns {object} Validation result with errors
 */
export function validateExercise(exercise) {
  const errors = {};
  
  // Validate name
  if (!exercise.name || exercise.name.trim() === '') {
    errors.name = 'Exercise name is required';
  }
  
  // Validate sets
  if (exercise.sets === undefined || exercise.sets === null) {
    errors.sets = 'Sets is required';
  } else if (isNaN(exercise.sets) || exercise.sets <= 0) {
    errors.sets = 'Sets must be a positive number';
  }
  
  // Validate reps
  if (exercise.reps === undefined || exercise.reps === null) {
    errors.reps = 'Reps is required';
  } else if (isNaN(exercise.reps) || exercise.reps <= 0) {
    errors.reps = 'Reps must be a positive number';
  }
  
  // Validate weight (can be 0)
  if (exercise.weight === undefined || exercise.weight === null) {
    errors.weight = 'Weight is required';
  } else if (isNaN(exercise.weight) || exercise.weight < 0) {
    errors.weight = 'Weight must be a non-negative number';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Format workout duration
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration
 */
export function formatDuration(minutes) {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }
  
  return `${hours} hr ${remainingMinutes} min`;
}