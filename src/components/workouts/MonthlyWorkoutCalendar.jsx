import { useState, useEffect } from 'react';
import { useWorkout } from '../../context/WorkoutContext';
import { toast } from 'react-hot-toast';
import { scheduleApi } from '../../services/api';
import { dateWorkoutApi } from '../../services/api';

export default function MonthlyWorkoutCalendar() {
  const { schedule, workouts, loading, fetchSchedule } = useWorkout();
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  const [dateSpecificWorkouts, setDateSpecificWorkouts] = useState({});
  const [availableWorkouts, setAvailableWorkouts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localUpdating, setLocalUpdating] = useState(false);
  const [workoutColors, setWorkoutColors] = useState({});
  
  // Day names for reference
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Color palette for workouts (more distinct colors)
  const colorPalette = [
    { bg: 'bg-blue-100', text: 'text-blue-800', darkBg: 'dark:bg-blue-900', darkText: 'dark:text-blue-200' },
    { bg: 'bg-green-100', text: 'text-green-800', darkBg: 'dark:bg-green-900', darkText: 'dark:text-green-200' },
    { bg: 'bg-red-100', text: 'text-red-800', darkBg: 'dark:bg-red-900', darkText: 'dark:text-red-200' },
    { bg: 'bg-purple-100', text: 'text-purple-800', darkBg: 'dark:bg-purple-900', darkText: 'dark:text-purple-200' },
    { bg: 'bg-yellow-100', text: 'text-yellow-800', darkBg: 'dark:bg-yellow-900', darkText: 'dark:text-yellow-200' },
    { bg: 'bg-indigo-100', text: 'text-indigo-800', darkBg: 'dark:bg-indigo-900', darkText: 'dark:text-indigo-200' },
    { bg: 'bg-pink-100', text: 'text-pink-800', darkBg: 'dark:bg-pink-900', darkText: 'dark:text-pink-200' },
    { bg: 'bg-teal-100', text: 'text-teal-800', darkBg: 'dark:bg-teal-900', darkText: 'dark:text-teal-200' }
  ];
  
  // Initialize available workouts and assign colors
  useEffect(() => {
    if (workouts && workouts.length > 0) {
      setAvailableWorkouts(workouts);
      
      // Assign a color to each workout
      const colors = {};
      workouts.forEach((workout, index) => {
        const colorIndex = index % colorPalette.length;
        colors[workout._id] = colorPalette[colorIndex];
      });
      setWorkoutColors(colors);
    }
  }, [workouts]);
  
  // Generate calendar days for the current month
  useEffect(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Get the day of week for the first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDay.getDay();
    
    // Calculate days from previous month to show
    const daysFromPrevMonth = firstDayOfWeek;
    
    // Calculate total days in the current month
    const daysInMonth = lastDay.getDate();
    
    // Calculate days from next month to show (to complete the grid)
    const totalCells = Math.ceil((daysFromPrevMonth + daysInMonth) / 7) * 7;
    const daysFromNextMonth = totalCells - daysFromPrevMonth - daysInMonth;
    
    // Generate calendar days array
    const days = [];
    
    // Add days from previous month
    const prevMonth = new Date(year, month - 1, 0);
    const prevMonthDays = prevMonth.getDate();
    
    for (let i = prevMonthDays - daysFromPrevMonth + 1; i <= prevMonthDays; i++) {
      const date = new Date(year, month - 1, i);
      days.push({
        date,
        day: i,
        currentMonth: false,
        dayName: dayNames[date.getDay()],
        dateString: formatDateString(date)
      });
    }
    
    // Add days from current month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        day: i,
        currentMonth: true,
        dayName: dayNames[date.getDay()],
        dateString: formatDateString(date)
      });
    }
    
    // Add days from next month
    for (let i = 1; i <= daysFromNextMonth; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        day: i,
        currentMonth: false,
        dayName: dayNames[date.getDay()],
        dateString: formatDateString(date)
      });
    }
    
    setCalendarDays(days);
    
    // Load date-specific workouts for this month range
    loadWorkoutsForDateRange(days[0].date, days[days.length - 1].date);
  }, [currentMonth]);
  
  // Format date as string (YYYY-MM-DD)
  const formatDateString = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };
  
  const loadWorkoutsForDateRange = async (startDate, endDate) => {
    try {
      const startDateStr = formatDateString(startDate);
      const endDateStr = formatDateString(endDate);
      
      const workoutsByDate = await dateWorkoutApi.getByDateRange(startDateStr, endDateStr);
      setDateSpecificWorkouts(workoutsByDate);
    } catch (error) {
      console.error('Error loading date-specific workouts:', error);
      toast.error('Failed to load workouts for this month');
    }
  };
  
  // Handle month navigation
  const goToPreviousMonth = () => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() - 1);
      return newMonth;
    });
  };
  
  const goToNextMonth = () => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() + 1);
      return newMonth;
    });
  };
  
  const goToCurrentMonth = () => {
    setCurrentMonth(new Date());
  };
  
  // Handle day selection
  const handleDayClick = (day) => {
    setSelectedDate(day);
    setIsModalOpen(true);
  };
  
  // Handle saving workout to specific date
  const handleSaveSchedule = async (day, selectedWorkoutIds) => {
    try {
      setLocalUpdating(true);
      
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
      
      // Update local state for immediate UI feedback
      const newDateSpecificWorkouts = { ...dateSpecificWorkouts };
      newDateSpecificWorkouts[day.dateString] = workoutDetails;
      setDateSpecificWorkouts(newDateSpecificWorkouts);
      
      await dateWorkoutApi.updateByDate(day.dateString, workoutDetails);
    
      toast.success(`Workouts for ${formatDisplayDate(day.date)} updated successfully`);
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast.error('Failed to update schedule');
    } finally {
      setLocalUpdating(false);
      setIsModalOpen(false);
      setSelectedDate(null);
    }
  };
  
  // Format month name
  const formatMonth = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };
  
  // Format display date
  const formatDisplayDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Check if a date is today
  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };
  
  // Get workouts for a specific date
  const getWorkoutsForDate = (dateString) => {
    return dateSpecificWorkouts[dateString] || [];
  };
  
  // Get color for a workout
  const getWorkoutColor = (workoutId) => {
    return workoutColors[workoutId] || {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      darkBg: 'dark:bg-gray-700',
      darkText: 'dark:text-gray-300'
    };
  };
  
  if (loading || localUpdating) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Monthly Workout Schedule
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={goToPreviousMonth}
            className="btn btn-secondary"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToCurrentMonth}
            className="btn btn-secondary"
          >
            Today
          </button>
          <button
            onClick={goToNextMonth}
            className="btn btn-secondary"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="text-xl font-medium text-center mb-4">
          {formatMonth(currentMonth)}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {dayNames.map(day => (
            <div key={day} className="text-center text-gray-500 font-medium text-sm py-2">
              {day.slice(0, 3)}
            </div>
          ))}
          
          {/* Calendar days */}
          {calendarDays.map((day, index) => {
            const dateWorkouts = getWorkoutsForDate(day.dateString);
            
            return (
              <div
                key={index}
                onClick={() => handleDayClick(day)}
                className={`
                  min-h-[100px] p-2 border border-gray-200 dark:border-gray-700 rounded
                  ${day.currentMonth ? 'bg-white dark:bg-gray-800' : 'bg-gray-100 dark:bg-gray-700 opacity-50'}
                  ${isToday(day.date) ? 'ring-2 ring-blue-500' : ''}
                  hover:shadow-md transition-shadow cursor-pointer
                `}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm font-medium ${
                    isToday(day.date) ? 'text-blue-600 dark:text-blue-400' : 
                    day.currentMonth ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {day.day}
                  </span>
                  {dateWorkouts.length > 0 && (
                    <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs px-1.5 py-0.5 rounded-full">
                      {dateWorkouts.length}
                    </span>
                  )}
                </div>
                
                {/* Workout chips - show max 3 with a +X more indicator */}
                <div className="space-y-1 mt-1">
                  {dateWorkouts.slice(0, 2).map((workout, idx) => {
                    const colorScheme = getWorkoutColor(workout.workoutId);
                    
                    return (
                      <div
                        key={idx}
                        className={`text-xs p-1 rounded truncate ${colorScheme.bg} ${colorScheme.text} ${colorScheme.darkBg} ${colorScheme.darkText}`}
                      >
                        {workout.name}
                      </div>
                    );
                  })}
                  
                  {dateWorkouts.length > 2 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      +{dateWorkouts.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Schedule Workout Modal */}
      {isModalOpen && selectedDate && (
        <ScheduleWorkoutModal
          day={selectedDate}
          availableWorkouts={availableWorkouts}
          selectedWorkouts={(getWorkoutsForDate(selectedDate.dateString) || []).map(w => w.workoutId)}
          workoutColors={workoutColors}
          onSave={handleSaveSchedule}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedDate(null);
          }}
        />
      )}
    </div>
  );
}

function ScheduleWorkoutModal({ day, availableWorkouts, selectedWorkouts, workoutColors, onSave, onCancel }) {
  const [selectedWorkoutIds, setSelectedWorkoutIds] = useState(selectedWorkouts || []);
  
  useEffect(() => {
    setSelectedWorkoutIds(selectedWorkouts || []);
  }, [selectedWorkouts]);
  
  const handleWorkoutToggle = (workoutId) => {
    if (selectedWorkoutIds.includes(workoutId)) {
      setSelectedWorkoutIds(selectedWorkoutIds.filter(id => id !== workoutId));
    } else {
      setSelectedWorkoutIds([...selectedWorkoutIds, workoutId]);
    }
  };
  
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Get color for a workout
  const getWorkoutColor = (workoutId) => {
    return workoutColors[workoutId] || {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      darkBg: 'dark:bg-gray-700',
      darkText: 'dark:text-gray-300'
    };
  };
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Schedule Workouts for {formatDate(day.date)}
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
          
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Workouts scheduled for this specific date (<strong>{day.date.toLocaleDateString()}</strong>), not for every {day.dayName}.
            </p>
          </div>
          
          {availableWorkouts.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500 dark:text-gray-400">
                No workouts available. Create workouts first to add them to your schedule.
              </p>
            </div>
          ) : (
            <div className="space-y-2 mb-6">
              {availableWorkouts.map(workout => {
                const colorScheme = getWorkoutColor(workout._id);
                
                return (
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
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          {workout.name}
                        </h3>
                        <div className={`ml-2 w-3 h-3 rounded-full ${colorScheme.bg}`}></div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {workout.type} • {workout.duration} minutes
                      </p>
                    </div>
                  </div>
                );
              })}
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