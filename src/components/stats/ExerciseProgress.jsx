// src/components/stats/ExerciseProgress.jsx
import { useState, useEffect } from 'react';
import { performanceApi } from '../../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useWorkout } from '../../context/WorkoutContext';

export default function ExerciseProgress() {
  const { workouts } = useWorkout();
  const [exerciseNames, setExerciseNames] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [timeRange, setTimeRange] = useState('all');
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('weight'); // 'weight', 'reps', 'volume'
  const [showTable, setShowTable] = useState(false);

  // Extract unique exercise names from all workouts
  useEffect(() => {
    if (workouts && workouts.length > 0) {
      const names = new Set();
      workouts.forEach(workout => {
        workout.exercises.forEach(exercise => {
          names.add(exercise.name);
        });
      });
      const sortedNames = [...names].sort();
      setExerciseNames(sortedNames);
      
      if (sortedNames.length > 0 && !selectedExercise) {
        setSelectedExercise(sortedNames[0]);
      }
    }
  }, [workouts, selectedExercise]);

  // Fetch stats when exercise or time range changes
  useEffect(() => {
    const fetchStats = async () => {
      if (!selectedExercise) return;
      
      setLoading(true);
      try {
        const data = await performanceApi.getExerciseStats(selectedExercise);
        
        // Filter by time range if needed
        let filteredData = [...data];
        
        if (timeRange !== 'all') {
          const now = new Date();
          let startDate;
          
          if (timeRange === 'week') {
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 7);
          } else if (timeRange === 'month') {
            startDate = new Date(now);
            startDate.setMonth(now.getMonth() - 1);
          } else if (timeRange === 'year') {
            startDate = new Date(now);
            startDate.setFullYear(now.getFullYear() - 1);
          }
          
          if (startDate) {
            filteredData = filteredData.filter(item => new Date(item.date) >= startDate);
          }
        }
        
        // Add additional calculated metrics
        filteredData = filteredData.map(item => {
          // Format date for display
          const formattedDate = new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          
          // Volume = total weight lifted
          return {
            ...item,
            formattedDate,
            volume: item.totalWeight
          };
        });
        
        setStats(filteredData);
      } catch (error) {
        console.error('Error fetching exercise stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [selectedExercise, timeRange]);

  const getChartData = () => {
    // Only use last 10 data points for mobile charts
    return stats.slice(-10).map((item) => ({
      ...item,
      date: item.formattedDate
    }));
  };

  const renderNoDataMessage = () => (
    <div className="flex flex-col items-center justify-center h-64">
      <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">No exercise data available</p>
      <p className="text-sm text-gray-500 dark:text-gray-500">
        Complete workouts with this exercise to see your progress
      </p>
    </div>
  );

  const renderExerciseStats = () => {
    if (stats.length === 0) {
      return renderNoDataMessage();
    }
    
    // Calculate summary statistics
    const latestStat = stats[stats.length - 1];
    const firstStat = stats[0];
    
    // Calculate changes
    const maxWeightChange = latestStat.maxWeight - firstStat.maxWeight;
    const totalRepsChange = latestStat.totalReps - firstStat.totalReps;
    const volumeChange = latestStat.volume - firstStat.volume;
    
    const getChangeColor = (change) => {
      return change > 0 ? 'text-green-600 dark:text-green-400' : 
             change < 0 ? 'text-red-600 dark:text-red-400' : 
             'text-gray-600 dark:text-gray-400';
    };
    
    const formatChange = (change) => {
      const prefix = change > 0 ? '+' : '';
      return `${prefix}${change.toFixed(1)}`;
    };
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3">
            <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400">Max Weight</h3>
            <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
              {latestStat.maxWeight} lbs
            </p>
            <p className={`text-xs ${getChangeColor(maxWeightChange)}`}>
              {formatChange(maxWeightChange)} lbs
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3">
            <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Reps</h3>
            <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
              {stats.reduce((sum, stat) => sum + stat.totalReps, 0)}
            </p>
            <p className={`text-xs ${getChangeColor(totalRepsChange)}`}>
              {formatChange(totalRepsChange)}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3">
            <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400">Volume</h3>
            <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
              {Math.round(stats.reduce((sum, stat) => sum + stat.volume, 0))}
            </p>
            <p className={`text-xs ${getChangeColor(volumeChange)}`}>
              {formatChange(volumeChange)}
            </p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 pt-4">
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                className={`px-3 py-1.5 text-sm rounded-md ${viewMode === 'weight' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}`}
                onClick={() => setViewMode('weight')}
              >
                Weight
              </button>
              <button
                className={`px-3 py-1.5 text-sm rounded-md ${viewMode === 'reps' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}`}
                onClick={() => setViewMode('reps')}
              >
                Reps
              </button>
              <button
                className={`px-3 py-1.5 text-sm rounded-md ${viewMode === 'volume' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}`}
                onClick={() => setViewMode('volume')}
              >
                Volume
              </button>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={220}>
            {viewMode === 'weight' ? (
              <LineChart data={getChartData()} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  fontSize={10}
                  tickMargin={5}
                />
                <YAxis 
                  fontSize={10}
                  width={30}
                  tickFormatter={(value) => value}
                />
                <Tooltip 
                  labelStyle={{ fontSize: 12 }}
                  contentStyle={{ fontSize: 12 }}
                  formatter={(value) => [`${value} lbs`, '']}
                />
                <Line 
                  type="monotone" 
                  dataKey="maxWeight" 
                  name="Max Weight" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            ) : viewMode === 'reps' ? (
              <BarChart data={getChartData()} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  fontSize={10}
                  tickMargin={5}
                />
                <YAxis 
                  fontSize={10}
                  width={30}
                />
                <Tooltip 
                  labelStyle={{ fontSize: 12 }}
                  contentStyle={{ fontSize: 12 }}
                  formatter={(value) => [`${value} reps`, '']}
                />
                <Bar 
                  dataKey="totalReps" 
                  name="Reps" 
                  fill="#8b5cf6" 
                  barSize={12}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            ) : (
              <LineChart data={getChartData()} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  fontSize={10}
                  tickMargin={5} 
                />
                <YAxis 
                  fontSize={10}
                  width={30}
                  tickFormatter={(value) => Math.round(value)}
                />
                <Tooltip 
                  labelStyle={{ fontSize: 12 }}
                  contentStyle={{ fontSize: 12 }}
                  formatter={(value) => [`${Math.round(value)} lbs`, '']}
                />
                <Line 
                  type="monotone" 
                  dataKey="volume" 
                  name="Volume" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
        
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Workout History
          </h3>
          <button
            onClick={() => setShowTable(!showTable)}
            className="text-blue-600 dark:text-blue-400 text-sm flex items-center"
          >
            {showTable ? 'Hide Table' : 'Show Table'}
            <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d={showTable ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
            </svg>
          </button>
        </div>
        
        {showTable && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Sets
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Reps
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Max
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {stats.slice().reverse().map((stat, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                        {stat.formattedDate}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                        {stat.sets.length}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                        {stat.totalReps}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                        {stat.maxWeight} lbs
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-4">
        <label htmlFor="exercise" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Exercise:
        </label>
        <select
          id="exercise"
          value={selectedExercise}
          onChange={(e) => setSelectedExercise(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          {exerciseNames.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>

        <label htmlFor="range" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-3 mb-1">
          Time Range:
        </label>
        <select
          id="range"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="all">All Time</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="year">Last 12 Months</option>
        </select>
      </div>
      
      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      ) : (
        renderExerciseStats()
      )}
    </div>
  );
}