// src/components/stats/ProgressChart.jsx
import { useState, useEffect } from 'react';
import { useWorkout } from '../../context/WorkoutContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ProgressChart() {
  const { workouts } = useWorkout();
  const [chartData, setChartData] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState('workoutCount');
  const [timeRange, setTimeRange] = useState('week');
  
  useEffect(() => {
    if (workouts.length === 0) return;
    
    // Generate chart data based on selected metric and time range
    const data = generateChartData(workouts, selectedMetric, timeRange);
    setChartData(data);
  }, [workouts, selectedMetric, timeRange]);
  
  // Helper to generate chart data
  const generateChartData = (workoutData, metric, range) => {
    // Sort workouts by date
    const sortedWorkouts = [...workoutData].sort((a, b) => 
      new Date(a.createdAt) - new Date(b.createdAt)
    );
    
    // Determine date format and grouping based on range
    let dateFormat, groupingFn;
    
    if (range === 'week') {
      // Group by day of week
      dateFormat = date => date.toLocaleDateString('en-US', { weekday: 'short' });
      groupingFn = date => date.getDay();
    } else if (range === 'month') {
      // Group by day of month
      dateFormat = date => date.getDate();
      groupingFn = date => date.getDate();
    } else if (range === 'year') {
      // Group by month
      dateFormat = date => date.toLocaleDateString('en-US', { month: 'short' });
      groupingFn = date => date.getMonth();
    }
    
    // Initialize data structure
    const dataMap = new Map();
    
    // Calculate start date based on range
    const now = new Date();
    let startDate;
    
    if (range === 'week') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else if (range === 'month') {
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
    } else if (range === 'year') {
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
    }
    
    // Filter workouts by date range
    const filteredWorkouts = sortedWorkouts.filter(workout => 
      new Date(workout.createdAt) >= startDate
    );
    
    // Group workouts
    filteredWorkouts.forEach(workout => {
      const date = new Date(workout.createdAt);
      const key = groupingFn(date);
      const formattedDate = dateFormat(date);
      
      if (!dataMap.has(key)) {
        dataMap.set(key, { 
          name: formattedDate,
          workoutCount: 0,
          totalDuration: 0,
          averageWeight: 0,
          totalExercises: 0,
          workouts: []
        });
      }
      
      const entry = dataMap.get(key);
      entry.workouts.push(workout);
      entry.workoutCount += 1;
      entry.totalDuration += workout.duration;
      entry.totalExercises += workout.exercises.length;
      
      // Calculate average weight (only for strength workouts)
      if (workout.type === 'strength') {
        const totalWeight = workout.exercises.reduce((sum, ex) => sum + ex.weight, 0);
        const avgWeight = totalWeight / workout.exercises.length;
        
        // Update running average
        const prevTotal = entry.averageWeight * (entry.workouts.length - 1);
        entry.averageWeight = (prevTotal + avgWeight) / entry.workouts.length;
      }
    });
    
    // Fill in missing dates
    if (range === 'week') {
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const key = date.getDay();
        const formattedDate = dateFormat(date);
        
        if (!dataMap.has(key)) {
          dataMap.set(key, {
            name: formattedDate,
            workoutCount: 0,
            totalDuration: 0,
            averageWeight: 0,
            totalExercises: 0,
            workouts: []
          });
        }
      }
    } else if (range === 'month') {
      const daysInMonth = 30;
      for (let i = 0; i < daysInMonth; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (daysInMonth - 1 - i));
        const key = date.getDate();
        const formattedDate = dateFormat(date);
        
        if (!dataMap.has(key)) {
          dataMap.set(key, {
            name: formattedDate,
            workoutCount: 0,
            totalDuration: 0,
            averageWeight: 0,
            totalExercises: 0,
            workouts: []
          });
        }
      }
    } else if (range === 'year') {
      for (let i = 0; i < 12; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - (11 - i));
        const key = date.getMonth();
        const formattedDate = dateFormat(date);
        
        if (!dataMap.has(key)) {
          dataMap.set(key, {
            name: formattedDate,
            workoutCount: 0,
            totalDuration: 0,
            averageWeight: 0,
            totalExercises: 0,
            workouts: []
          });
        }
      }
    }
    
    // Convert map to array and sort by date
    let result = Array.from(dataMap.entries())
      .map(([key, value]) => ({ key, ...value }));
    
    if (range === 'week') {
      // Sort days of week in order
      result.sort((a, b) => a.key - b.key);
    } else if (range === 'month') {
      // Sort by day of month
      result.sort((a, b) => a.key - b.key);
    } else if (range === 'year') {
      // Sort by month
      result.sort((a, b) => a.key - b.key);
    }
    
    return result;
  };
  
  const renderNoDataMessage = () => (
    <div className="flex flex-col items-center justify-center h-64">
      <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">No workout data available</p>
      <p className="text-sm text-gray-500 dark:text-gray-500">
        Complete workouts to see your progress here
      </p>
    </div>
  );
  
  const getMetricColor = (metric) => {
    switch (metric) {
      case 'workoutCount':
        return '#3b82f6'; // Blue
      case 'totalDuration':
        return '#10b981'; // Green
      case 'averageWeight':
        return '#ef4444'; // Red
      case 'totalExercises':
        return '#8b5cf6'; // Purple
      default:
        return '#6b7280'; // Gray
    }
  };
  
  const getMetricLabel = (metric) => {
    switch (metric) {
      case 'workoutCount':
        return 'Workouts';
      case 'totalDuration':
        return 'Duration (min)';
      case 'averageWeight':
        return 'Avg. Weight';
      case 'totalExercises':
        return 'Exercises';
      default:
        return 'Value';
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <div>
          <label htmlFor="metric" className="label mr-2">
            Metric:
          </label>
          <select
            id="metric"
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="input sm:w-auto"
          >
            <option value="workoutCount">Workout Count</option>
            <option value="totalDuration">Total Duration</option>
            <option value="averageWeight">Average Weight</option>
            <option value="totalExercises">Exercises</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="range" className="label mr-2">
            Time Range:
          </label>
          <select
            id="range"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="input sm:w-auto"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last 12 Months</option>
          </select>
        </div>
      </div>
      
      {workouts.length === 0 ? (
        renderNoDataMessage()
      ) : (
        <div className="card p-4">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={selectedMetric} 
                name={getMetricLabel(selectedMetric)}
                stroke={getMetricColor(selectedMetric)} 
                strokeWidth={2}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}