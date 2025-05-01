import { useState } from 'react';
import WorkoutCalendar from '../components/workouts/WorkoutCalendar';
import MonthlyWorkoutCalendar from '../components/workouts/MonthlyWorkoutCalendar';

export default function SchedulePage() {
  const [calendarView, setCalendarView] = useState('weekly'); // 'weekly' or 'monthly'

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Workout Schedule</h1>
        
        <div className="inline-flex rounded-md shadow-sm">
          <button
            type="button"
            onClick={() => setCalendarView('weekly')}
            className={`px-4 py-2 text-sm font-medium rounded-l-md focus:z-10 focus:outline-none 
              ${calendarView === 'weekly' 
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
              }`}
          >
            Weekly
          </button>
          <button
            type="button"
            onClick={() => setCalendarView('monthly')}
            className={`px-4 py-2 text-sm font-medium rounded-r-md focus:z-10 focus:outline-none
              ${calendarView === 'monthly' 
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
              }`}
          >
            Monthly
          </button>
        </div>
      </div>
      
      {calendarView === 'weekly' ? (
        <div className="card p-6">
          <WorkoutCalendar />
        </div>
      ) : (
        <MonthlyWorkoutCalendar />
      )}
    </div>
  );
}