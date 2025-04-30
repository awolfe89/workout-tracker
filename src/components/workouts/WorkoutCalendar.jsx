import { useState, useEffect } from 'react';
import { useWorkout } from '../../context/WorkoutContext';
import { toast } from 'react-hot-toast';
import { scheduleApi } from '../../services/api';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function WorkoutCalendar() {
  const { schedule, updateSchedule, workouts, loading } = useWorkout();
  const [selectedDay, setSelectedDay] = useState(null);
  const [scheduledWorkouts, setScheduledWorkouts] = useState({});
  const [availableWorkouts, setAvailableWorkouts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Initialize schedule structure and available workouts
  useEffect(() => {
    if (workouts && workouts.length > 0) {
      setAvailableWorkouts(workouts);
    }
    
    // Convert the schedule data for easier access
    if (schedule && schedule.days && schedule.days.length > 0) {
      const scheduleMap = {};
      schedule.days.forEach(daySchedule => {
        scheduleMap[daySchedule.day] = daySchedule.workouts || [];
      });
      setScheduledWorkouts(scheduleMap);
    }
  }, [schedule, workouts]);
  
  const handleDayClick = (day) => {
    setSelectedDay(day);
    setIsModalOpen(true);
  };
  
  const handleSaveSchedule = async (day, selectedWorkoutIds) => {
    try {
      // Find the workout objects based on the selected IDs
      const workoutDetails = selectedWorkoutIds.map(id => {
        const workout = availableWorkouts.find(w => w._id === id);
        if (!workout) return null;
        return {
          workoutId: workout._id,
          name: workout.name,
          type: workout.type,
          duration: workout.duration
        };
      }).filter(w => w); // Remove any null entries
      
      // Check if we have a valid schedule structure
      if (!schedule || !Array.isArray(schedule.days)) {
        console.error('Invalid schedule structure:', schedule);
        toast.error('Invalid schedule structure. Please refresh the page.');
        return;
      }
      
      // Make a deep copy of the days array
      const updatedDays = JSON.parse(JSON.stringify(schedule.days || []));
      const dayIndex = updatedDays.findIndex(d => d.day === day);
      
      if (dayIndex !== -1) {
        // Update the existing day
        updatedDays[dayIndex].workouts = workoutDetails;
      } else {
        // Day doesn't exist, create it
        updatedDays.push({
          day: day,
          workouts: workoutDetails
        });
      }
      
      // Update the entire schedule with the modified days array
      await scheduleApi.update({ days: updatedDays });
      
      // Update local state for immediate UI update
      const newScheduledWorkouts = { ...scheduledWorkouts };
      newScheduledWorkouts[day] = workoutDetails;
      setScheduledWorkouts(newScheduledWorkouts);
      
      toast.success(`Schedule for ${day} updated successfully`);
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast.error('Failed to update schedule');
    }
    
    setIsModalOpen(false);
    setSelectedDay(null);
  };
  
  // Calculate weekly stats
  const calculateWeeklyStats = () => {
    let totalWorkouts = 0;
    let totalDuration = 0;
    let workoutTypes = {};
    
    Object.values(scheduledWorkouts).forEach(dayWorkouts => {
      if (dayWorkouts && Array.isArray(dayWorkouts)) {
        totalWorkouts += dayWorkouts.length;
        dayWorkouts.forEach(workout => {
          if (workout && workout.duration) {
            totalDuration += workout.duration;
          }
          if (workout && workout.type) {
            workoutTypes[workout.type] = (workoutTypes[workout.type] || 0) + 1;
          }
        });
      }
    });
    
    return { totalWorkouts, totalDuration, workoutTypes };
  };
  
  const weeklyStats = calculateWeeklyStats();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {DAYS_OF_WEEK.map(day => {
          const dayWorkouts = scheduledWorkouts[day] || [];
          
          return (
            <div 
              key={day}
              className="card p-4 min-h-[150px] cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleDayClick(day)}
            >
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">{day}</h3>
              
              {dayWorkouts.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No workouts scheduled
                </p>
              ) : (
                <div className="space-y-2">
                  {dayWorkouts.map((workout, idx) => (
                    <div 
                      key={`${workout.workoutId}-${idx}`}
                      className={`text-sm rounded-md p-2
                        ${workout.type === 'strength' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          workout.type === 'cardio' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          workout.type === 'hiit' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          workout.type === 'flexibility' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}
                    >
                      <div className="font-medium">{workout.name}</div>
                      <div className="text-xs">{workout.duration} min</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">Total Workouts</h3>
          <p className="text-3xl font-bold text-blue-600">{weeklyStats.totalWorkouts}</p>
        </div>
        
        <div className="card p-4">
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">Total Duration</h3>
          <p className="text-3xl font-bold text-green-600">{weeklyStats.totalDuration} min</p>
        </div>
        
        <div className="card p-4">
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">Workout Types</h3>
          <div className="space-y-2">
            {Object.entries(weeklyStats.workoutTypes).map(([type, count]) => (
              <div key={type} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Schedule Workout Modal */}
      {isModalOpen && selectedDay && (
        <ScheduleWorkoutModal
          day={selectedDay}
          availableWorkouts={availableWorkouts}
          selectedWorkouts={(scheduledWorkouts[selectedDay] || []).map(w => w.workoutId)}
          onSave={handleSaveSchedule}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedDay(null);
          }}
        />
      )}
    </div>
  );
}

function ScheduleWorkoutModal({ day, availableWorkouts, selectedWorkouts, onSave, onCancel }) {
  const [selectedWorkoutIds, setSelectedWorkoutIds] = useState(selectedWorkouts || []);
  
  const handleWorkoutToggle = (workoutId) => {
    if (selectedWorkoutIds.includes(workoutId)) {
      setSelectedWorkoutIds(selectedWorkoutIds.filter(id => id !== workoutId));
    } else {
      setSelectedWorkoutIds([...selectedWorkoutIds, workoutId]);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Schedule Workouts for {day}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {availableWorkouts.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500 dark:text-gray-400">
                No workouts available. Create workouts first to add them to your schedule.
              </p>
            </div>
          ) : (
            <div className="space-y-2 mb-6">
              {availableWorkouts.map(workout => (
                <div 
                  key={workout._id} 
                  className={`border rounded-md p-3 flex items-center space-x-3 cursor-pointer
                    ${selectedWorkoutIds.includes(workout._id) 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 dark:border-blue-400' 
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                  onClick={() => handleWorkoutToggle(workout._id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedWorkoutIds.includes(workout._id)}
                    onChange={() => {}}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {workout.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {workout.type} • {workout.duration} minutes
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(day, selectedWorkoutIds)}
              className="btn btn-primary"
            >
              Save Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}