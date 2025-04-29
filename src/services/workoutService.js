// src/services/workoutService.js

/**
 * Service for workout data management
 */
class WorkoutService {
  /**
   * Get all workouts from localStorage
   * @returns {Array} Array of workout objects
   */
  getWorkouts() {
    try {
      const workouts = localStorage.getItem('workouts');
      return workouts ? JSON.parse(workouts) : [];
    } catch (error) {
      console.error('Error getting workouts from localStorage:', error);
      return [];
    }
  }

  /**
   * Get a specific workout by ID
   * @param {string} id - Workout ID
   * @returns {object|null} Workout object or null if not found
   */
  getWorkoutById(id) {
    try {
      const workouts = this.getWorkouts();
      return workouts.find(workout => workout.id === id) || null;
    } catch (error) {
      console.error(`Error getting workout with ID ${id}:`, error);
      return null;
    }
  }

  /**
   * Save a new workout
   * @param {object} workout - Workout object to save
   * @returns {object} Saved workout with generated ID
   */
  saveWorkout(workout) {
    try {
      const workouts = this.getWorkouts();
      
      // Generate a new ID if not provided
      const newWorkout = {
        ...workout,
        id: workout.id || Date.now().toString(),
        createdAt: workout.createdAt || new Date().toISOString(),
      };
      
      // Add to workouts array
      workouts.push(newWorkout);
      
      // Save to localStorage
      localStorage.setItem('workouts', JSON.stringify(workouts));
      
      return newWorkout;
    } catch (error) {
      console.error('Error saving workout:', error);
      throw new Error('Failed to save workout');
    }
  }

  /**
   * Update an existing workout
   * @param {string} id - Workout ID
   * @param {object} updatedData - New workout data
   * @returns {object} Updated workout
   */
  updateWorkout(id, updatedData) {
    try {
      const workouts = this.getWorkouts();
      const index = workouts.findIndex(workout => workout.id === id);
      
      if (index === -1) {
        throw new Error(`Workout with ID ${id} not found`);
      }
      
      // Update the workout with new data and add updatedAt timestamp
      const updatedWorkout = {
        ...workouts[index],
        ...updatedData,
        updatedAt: new Date().toISOString(),
      };
      
      // Replace the old workout with the updated one
      workouts[index] = updatedWorkout;
      
      // Save to localStorage
      localStorage.setItem('workouts', JSON.stringify(workouts));
      
      return updatedWorkout;
    } catch (error) {
      console.error(`Error updating workout with ID ${id}:`, error);
      throw new Error('Failed to update workout');
    }
  }

  /**
   * Delete a workout
   * @param {string} id - Workout ID
   * @returns {boolean} Success status
   */
  deleteWorkout(id) {
    try {
      const workouts = this.getWorkouts();
      const filteredWorkouts = workouts.filter(workout => workout.id !== id);
      
      // Check if any workout was removed
      if (filteredWorkouts.length === workouts.length) {
        throw new Error(`Workout with ID ${id} not found`);
      }
      
      // Save to localStorage
      localStorage.setItem('workouts', JSON.stringify(filteredWorkouts));
      
      return true;
    } catch (error) {
      console.error(`Error deleting workout with ID ${id}:`, error);
      throw new Error('Failed to delete workout');
    }
  }

  /**
   * Filter workouts by various criteria
   * @param {object} filters - Filter criteria
   * @returns {Array} Filtered workouts
   */
  filterWorkouts(filters = {}) {
    try {
      let workouts = this.getWorkouts();
      
      // Filter by name
      if (filters.name) {
        const name = filters.name.toLowerCase();
        workouts = workouts.filter(workout => 
          workout.name.toLowerCase().includes(name)
        );
      }
      
      // Filter by type
      if (filters.type && filters.type !== 'all') {
        workouts = workouts.filter(workout => workout.type === filters.type);
      }
      
      // Filter by date range
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        workouts = workouts.filter(workout => 
          new Date(workout.createdAt) >= startDate
        );
      }
      
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        workouts = workouts.filter(workout => 
          new Date(workout.createdAt) <= endDate
        );
      }
      
      // Filter by duration
      if (filters.minDuration) {
        workouts = workouts.filter(workout => 
          workout.duration >= filters.minDuration
        );
      }
      
      if (filters.maxDuration) {
        workouts = workouts.filter(workout => 
          workout.duration <= filters.maxDuration
        );
      }
      
      // Sort workouts
      if (filters.sortBy) {
        const sortDirection = filters.sortDirection === 'asc' ? 1 : -1;
        
        workouts.sort((a, b) => {
          switch (filters.sortBy) {
            case 'name':
              return sortDirection * a.name.localeCompare(b.name);
            case 'type':
              return sortDirection * a.type.localeCompare(b.type);
            case 'duration':
              return sortDirection * (a.duration - b.duration);
            case 'date':
            default:
              return sortDirection * (new Date(a.createdAt) - new Date(b.createdAt));
          }
        });
      }
      
      return workouts;
    } catch (error) {
      console.error('Error filtering workouts:', error);
      return [];
    }
  }

  /**
   * Get workout schedule
   * @returns {Array} Workout schedule
   */
  getSchedule() {
    try {
      const schedule = localStorage.getItem('schedule');
      return schedule ? JSON.parse(schedule) : [];
    } catch (error) {
      console.error('Error getting schedule from localStorage:', error);
      return [];
    }
  }

  /**
   * Save workout schedule
   * @param {Array} schedule - Workout schedule
   * @returns {Array} Saved schedule
   */
  saveSchedule(schedule) {
    try {
      localStorage.setItem('schedule', JSON.stringify(schedule));
      return schedule;
    } catch (error) {
      console.error('Error saving schedule to localStorage:', error);
      throw new Error('Failed to save workout schedule');
    }
  }

  /**
   * Get today's scheduled workouts
   * @returns {Array} Today's workouts
   */
  getTodayWorkouts() {
    try {
      const schedule = this.getSchedule();
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      
      const todaySchedule = schedule.find(day => day.day === today);
      return todaySchedule ? todaySchedule.workouts : [];
    } catch (error) {
      console.error('Error getting today\'s workouts:', error);
      return [];
    }
  }

  /**
   * Calculate workout statistics
   * @param {Array} workouts - Array of workouts (optional)
   * @returns {object} Workout statistics
   */
  calculateStats(workouts = null) {
    try {
      const allWorkouts = workouts || this.getWorkouts();
      
      if (allWorkouts.length === 0) {
        return {
          totalWorkouts: 0,
          totalDuration: 0,
          averageDuration: 0,
          workoutTypes: {},
          totalExercises: 0,
          mostFrequentExercise: null,
        };
      }
      
      // Calculate total duration
      const totalDuration = allWorkouts.reduce((sum, workout) => sum + workout.duration, 0);
      
      // Calculate average duration
      const averageDuration = totalDuration / allWorkouts.length;
      
      // Count workout types
      const workoutTypes = {};
      allWorkouts.forEach(workout => {
        workoutTypes[workout.type] = (workoutTypes[workout.type] || 0) + 1;
      });
      
      // Count exercises
      let totalExercises = 0;
      const exerciseCounts = {};
      
      allWorkouts.forEach(workout => {
        workout.exercises.forEach(exercise => {
          totalExercises++;
          exerciseCounts[exercise.name] = (exerciseCounts[exercise.name] || 0) + 1;
        });
      });
      
      // Find most frequent exercise
      let mostFrequentExercise = null;
      let maxCount = 0;
      
      Object.entries(exerciseCounts).forEach(([name, count]) => {
        if (count > maxCount) {
          mostFrequentExercise = name;
          maxCount = count;
        }
      });
      
      return {
        totalWorkouts: allWorkouts.length,
        totalDuration,
        averageDuration,
        workoutTypes,
        totalExercises,
        mostFrequentExercise,
      };
    } catch (error) {
      console.error('Error calculating workout stats:', error);
      return {
        totalWorkouts: 0,
        totalDuration: 0,
        averageDuration: 0,
        workoutTypes: {},
        totalExercises: 0,
        mostFrequentExercise: null,
      };
    }
  }

  /**
   * Clear all workout data
   * @returns {boolean} Success status
   */
  clearAllData() {
    try {
      localStorage.removeItem('workouts');
      localStorage.removeItem('schedule');
      return true;
    } catch (error) {
      console.error('Error clearing workout data:', error);
      throw new Error('Failed to clear workout data');
    }
  }
}

// Create and export a single instance
const workoutService = new WorkoutService();
export default workoutService;