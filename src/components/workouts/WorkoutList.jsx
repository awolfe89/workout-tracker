// src/components/workouts/WorkoutList.jsx
import { useState, useEffect } from 'react';
import { useWorkout } from '../../context/WorkoutContext';
import { toast } from 'react-hot-toast';

export default function WorkoutList({ onSelectWorkout }) {
  const { workouts, deleteWorkout, loading } = useWorkout();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [animateOut, setAnimateOut] = useState(null);
  
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    
    // Animate card out before deleting
    setAnimateOut(id);
    
    // Wait for animation to complete before confirming
    setTimeout(() => {
      if (window.confirm('Are you sure you want to delete this workout?')) {
        deleteWorkout(id)
          .then(() => {
            toast.success('Workout deleted successfully');
          })
          .catch(() => {
            toast.error('Failed to delete workout');
            setAnimateOut(null); // Reset animation if error
          });
      } else {
        setAnimateOut(null); // Reset animation if cancelled
      }
    }, 300);
  };
  
  const filteredWorkouts = workouts
    .filter(workout => {
      const matchesSearch = workout.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (workout.notes && workout.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = filterType === 'all' || workout.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-4">
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-12 rounded-lg"></div>
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-12 rounded-lg"></div>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-36 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search workouts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 h-12 w-full"
          />
          {searchTerm && (
            <button 
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              onClick={() => setSearchTerm('')}
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-3 overflow-x-auto py-1">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              filterType === 'all' 
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
            }`}
          >
            All Types
          </button>
          
          <button
            onClick={() => setFilterType('strength')}
            className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              filterType === 'strength' 
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
            }`}
          >
            Strength
          </button>
          
          <button
            onClick={() => setFilterType('cardio')}
            className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              filterType === 'cardio' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
            }`}
          >
            Cardio
          </button>
          
          <button
            onClick={() => setFilterType('hiit')}
            className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              filterType === 'hiit' 
                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
            }`}
          >
            HIIT
          </button>
          
          <button
            onClick={() => setFilterType('flexibility')}
            className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              filterType === 'flexibility' 
                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
            }`}
          >
            Flexibility
          </button>
          
          <button
            onClick={() => setFilterType('mixed')}
            className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              filterType === 'mixed' 
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' 
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
            }`}
          >
            Mixed
          </button>
        </div>
      </div>
      
      {filteredWorkouts.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            No workouts found
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
            {searchTerm || filterType !== 'all' 
              ? 'Try adjusting your filters or create a new workout'
              : 'Create your first workout to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredWorkouts.map(workout => (
            <div
              key={workout._id}
              onClick={() => onSelectWorkout(workout)}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden transition-all transform hover:shadow-md active:scale-98 ${
                animateOut === workout._id ? 'opacity-0 -translate-x-full' : 'opacity-100'
              }`}
            >
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {workout.name}
                    </h3>
                    <div className="mt-1 flex items-center">
                      <div 
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${workout.type === 'strength' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' :
                            workout.type === 'cardio' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                            workout.type === 'hiit' ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' :
                            workout.type === 'flexibility' ? 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}
                      >
                        {workout.type.charAt(0).toUpperCase() + workout.type.slice(1)}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => handleDelete(workout._id, e)}
                    className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 rounded-full hover:bg-red-50 dark:hover:bg-red-900 transition-colors"
                    aria-label="Delete workout"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {workout.duration} min
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}
                  </div>
                  
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(workout.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">View details</span>
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}