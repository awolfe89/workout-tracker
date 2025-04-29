import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { performanceApi } from '../../services/api';
import { useWorkout } from '../../context/WorkoutContext';

export default function WorkoutHistory() {
  const navigate = useNavigate();
  const { workouts } = useWorkout();
  const [performances, setPerformances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPerformance, setSelectedPerformance] = useState(null);
  const [filterWorkout, setFilterWorkout] = useState('all');
  
  // Fetch all workout performances
  useEffect(() => {
    const fetchPerformances = async () => {
      try {
        setLoading(true);
        const data = await performanceApi.getAll();
        setPerformances(data);
      } catch (err) {
        console.error('Failed to fetch workout performances:', err);
        setError('Failed to load workout history. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPerformances();
  }, []);
  
  // Handle filtering by workout type
  const filteredPerformances = filterWorkout === 'all'
    ? performances
    : performances.filter(perf => perf.workoutId === filterWorkout);
  
  // Sort by date (newest first)
  const sortedPerformances = [...filteredPerformances].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  
  // Format time (seconds to mm:ss)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate total weight lifted in a workout
  const calculateTotalWeight = (exercises) => {
    return exercises.reduce((total, exercise) => {
      const exerciseTotal = exercise.sets.reduce((setTotal, set) => {
        return setTotal + (set.weight * set.reps);
      }, 0);
      return total + exerciseTotal;
    }, 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  if (performances.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          No workout history found. Complete a workout to see it here.
        </p>
        <button
          onClick={() => navigate('/workouts')}
          className="btn btn-primary"
        >
          Go to Workouts
        </button>
      </div>
    );
  }

  // View for detailed performance
  if (selectedPerformance) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {selectedPerformance.workoutName} - {new Date(selectedPerformance.createdAt).toLocaleDateString()}
          </h2>
          <button
            onClick={() => setSelectedPerformance(null)}
            className="btn btn-secondary"
          >
            Back to History
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Duration</h3>
            <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {formatTime(selectedPerformance.duration)}
            </p>
          </div>
          
          <div className="card p-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Volume</h3>
            <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {selectedPerformance.totalWeight} lbs
            </p>
          </div>
          
          <div className="card p-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Reps</h3>
            <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {selectedPerformance.totalReps}
            </p>
          </div>
        </div>
        
        {selectedPerformance.notes && (
          <div className="card p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Workout Notes</h3>
            <p className="text-gray-600 dark:text-gray-400">{selectedPerformance.notes}</p>
          </div>
        )}
        
        <div className="card p-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Exercises</h3>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {selectedPerformance.exercises.map((exercise, exIndex) => (
              <div key={exIndex} className="py-4 first:pt-0 last:pb-0">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  {exercise.exerciseName}
                </h4>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Set
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Weight (lbs)
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Reps
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {exercise.sets.map((set, setIndex) => (
                        <tr key={setIndex} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {set.setNumber}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {set.weight}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {set.reps}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                            {set.notes || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // History list view
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Workout History
        </h2>
        
        <div>
          <label htmlFor="filter-workout" className="sr-only">Filter by workout</label>
          <select
            id="filter-workout"
            value={filterWorkout}
            onChange={(e) => setFilterWorkout(e.target.value)}
            className="input"
          >
            <option value="all">All Workouts</option>
            {workouts.map(workout => (
              <option key={workout._id} value={workout._id}>
                {workout.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Workout
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Volume
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Reps
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedPerformances.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  No workouts match this filter
                </td>
              </tr>
            ) : (
              sortedPerformances.map(performance => (
                <tr key={performance._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(performance.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {performance.workoutName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatTime(performance.duration)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {performance.totalWeight} lbs
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {performance.totalReps}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <button
                      onClick={() => setSelectedPerformance(performance)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}