import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useWorkout } from '../context/WorkoutContext';

export default function Dashboard() {
  const { workouts, schedule } = useWorkout();
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    weeklyWorkouts: 0,
    scheduledToday: [],
    recentWorkouts: []
  });
  
  useEffect(() => {
    // Calculate dashboard stats
    if (workouts && workouts.length > 0) {
      // Total workouts
      const totalWorkouts = workouts.length;
      
      // Workouts in the last 7 days
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const weeklyWorkouts = workouts.filter(workout => 
        new Date(workout.createdAt) >= oneWeekAgo
      ).length;
      
      // Recent workouts (last 3)
      const recentWorkouts = [...workouts]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3);
      
      // Scheduled workouts for today
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      const todaySchedule = schedule?.find(day => day.day === today);
      const scheduledToday = todaySchedule?.workouts || [];
      
      setStats({
        totalWorkouts,
        weeklyWorkouts,
        scheduledToday,
        recentWorkouts
      });
    }
  }, [workouts, schedule]);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <Link to="/workouts" className="btn btn-primary">
          Add New Workout
        </Link>
      </div>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Total Workouts
                </dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900 dark:text-white">
                    {stats.totalWorkouts}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        
        <div className="card p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Workouts This Week
                </dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900 dark:text-white">
                    {stats.weeklyWorkouts}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        
        <div className="card p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Scheduled Today
                </dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900 dark:text-white">
                    {stats.scheduledToday.length}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        
        <div className="card p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Days Active
                </dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900 dark:text-white">
                    {schedule?.filter(day => day.workouts.length > 0).length || 0}/7
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Today's Schedule
          </h2>
          
          {stats.scheduledToday.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500 dark:text-gray-400">
                No workouts scheduled for today
              </p>
              <Link to="/schedule" className="inline-block mt-2 text-sm text-blue-600 dark:text-blue-400">
                Add workouts to your schedule
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.scheduledToday.map(workout => (
                <div 
                  key={workout.workoutId || workout._id}
                  className="border border-gray-200 dark:border-gray-700 rounded-md p-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-md font-medium text-gray-900 dark:text-white">
                        {workout.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {workout.duration} minutes • {workout.type}
                      </p>
                    </div>
                    <Link 
                      to="/workouts" 
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="card p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Recent Workouts
          </h2>
          
          {stats.recentWorkouts.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500 dark:text-gray-400">
                No recent workouts
              </p>
              <Link to="/workouts" className="inline-block mt-2 text-sm text-blue-600 dark:text-blue-400">
                Create your first workout
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentWorkouts.map(workout => (
                <div 
                  key={workout._id}
                  className="border border-gray-200 dark:border-gray-700 rounded-md p-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-md font-medium text-gray-900 dark:text-white">
                        {workout.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {workout.exercises.length} exercises • {workout.duration} minutes
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {new Date(workout.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Link 
                      to="/workouts" 
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
              
              <div className="text-center pt-2">
                <Link to="/workouts" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                  View all workouts
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}