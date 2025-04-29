import { useState, useEffect, useMemo } from 'react';
import { useWorkout } from '../../context/WorkoutContext';

export default function HistoricalData() {
  const { workouts } = useWorkout();
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Filter workouts based on timeframe and search term
  const filteredWorkouts = useMemo(() => {
    // Start with all workouts
    let filtered = [...workouts];
    
    // Filter by timeframe
    if (selectedTimeframe !== 'all') {
      const now = new Date();
      let startDate;
      
      switch (selectedTimeframe) {
        case 'week':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate = new Date(now);
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          startDate = null;
      }
      
      if (startDate) {
        filtered = filtered.filter(workout => 
          new Date(workout.createdAt) >= startDate
        );
      }
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(workout => 
        workout.name.toLowerCase().includes(term) ||
        workout.type.toLowerCase().includes(term) ||
        (workout.notes && workout.notes.toLowerCase().includes(term)) ||
        workout.exercises.some(ex => ex.name.toLowerCase().includes(term))
      );
    }
    
    // Sort workouts
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdAt) - new Date(b.createdAt);
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'duration':
          comparison = a.duration - b.duration;
          break;
        case 'exercises':
          comparison = a.exercises.length - b.exercises.length;
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  }, [workouts, selectedTimeframe, searchTerm, sortBy, sortDirection]);
  
  // Calculate workout stats
  const stats = useMemo(() => {
    if (filteredWorkouts.length === 0) {
      return {
        totalWorkouts: 0,
        totalDuration: 0,
        averageDuration: 0,
        longestWorkout: null,
        mostFrequentType: null,
        mostFrequentExercise: null
      };
    }
    
    // Total duration
    const totalDuration = filteredWorkouts.reduce((sum, workout) => sum + workout.duration, 0);
    
    // Average duration
    const averageDuration = totalDuration / filteredWorkouts.length;
    
    // Longest workout
    const longestWorkout = filteredWorkouts.reduce(
      (longest, current) => current.duration > longest.duration ? current : longest,
      filteredWorkouts[0]
    );
    
    // Most frequent workout type
    const typeCounts = {};
    filteredWorkouts.forEach(workout => {
      typeCounts[workout.type] = (typeCounts[workout.type] || 0) + 1;
    });
    
    const mostFrequentType = Object.entries(typeCounts).reduce(
      (most, [type, count]) => count > most.count ? { type, count } : most,
      { type: null, count: 0 }
    );
    
    // Most frequent exercise
    const exerciseCounts = {};
    filteredWorkouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        exerciseCounts[exercise.name] = (exerciseCounts[exercise.name] || 0) + 1;
      });
    });
    
    const mostFrequentExercise = Object.entries(exerciseCounts).reduce(
      (most, [exercise, count]) => count > most.count ? { exercise, count } : most,
      { exercise: null, count: 0 }
    );
    
    return {
      totalWorkouts: filteredWorkouts.length,
      totalDuration,
      averageDuration,
      longestWorkout,
      mostFrequentType,
      mostFrequentExercise
    };
  }, [filteredWorkouts]);
  
  const handleSort = (field) => {
    if (sortBy === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to descending for new sort field
      setSortBy(field);
      setSortDirection('desc');
    }
  };
  
  const renderSortIcon = (field) => {
    if (sortBy !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
        </svg>
      );
    }
    
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Workouts</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalWorkouts}</p>
        </div>
        
        <div className="card p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Duration</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalDuration} mins</p>
        </div>
        
        <div className="card p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Duration</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
            {stats.averageDuration > 0 ? Math.round(stats.averageDuration) : 0} mins
          </p>
        </div>
        
        <div className="card p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Most Common Type</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white capitalize">
            {stats.mostFrequentType?.type || 'N/A'}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="col-span-1">
          <label htmlFor="timeframe" className="label">
            Timeframe
          </label>
          <select
            id="timeframe"
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="input"
          >
            <option value="all">All Time</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>
        </div>
        
        <div className="md:col-span-2">
          <label htmlFor="search" className="label">
            Search Workouts
          </label>
          <input
            type="text"
            id="search"
            placeholder="Search by name, type, or exercise..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input"
          />
        </div>
      </div>
      
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Date</span>
                    {renderSortIcon('date')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Workout</span>
                    {renderSortIcon('name')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('type')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Type</span>
                    {renderSortIcon('type')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('duration')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Duration</span>
                    {renderSortIcon('duration')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('exercises')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Exercises</span>
                    {renderSortIcon('exercises')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredWorkouts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No workouts found
                  </td>
                </tr>
              ) : (
                filteredWorkouts.map((workout) => (
                  <tr key={workout._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(workout.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {workout.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">
                      {workout.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {workout.duration} mins
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {workout.exercises.length}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}