// src/pages/WorkoutsPage.jsx
import React, { useState } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import WorkoutList from '../components/workouts/WorkoutList';
import WorkoutDetail from '../components/workouts/WorkoutDetail';
import WorkoutForm from '../components/workouts/WorkoutForm';
import ActiveWorkout from '../components/workouts/ActiveWorkout';

export default function WorkoutsPage() {
  const { error } = useWorkout();
  const [activeTab, setActiveTab] = useState('list');
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  const handleSelectWorkout = (workout) => {
    setSelectedWorkout(workout);
    setActiveTab('detail');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'list') {
      setSelectedWorkout(null);
    }
  };

  const handleStartWorkout = () => {
    if (selectedWorkout) {
      setActiveTab('active');
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {/* Only show the Workouts header on larger screens where there's space */}
          <span className="md:inline hidden">Workouts</span>
        </h1>
        <div className="flex space-x-2 w-full md:w-auto justify-end">
          <button
            onClick={() => handleTabChange('list')}
            className={`px-4 py-3 md:py-2 rounded-lg text-sm font-medium flex-1 md:flex-none text-center
              ${activeTab === 'list' 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'}`}
          >
            {/* Simplified text for mobile */}
            <span className="md:hidden">All</span>
            <span className="hidden md:inline">All Workouts</span>
          </button>
          <button
            onClick={() => handleTabChange('create')}
            className={`px-4 py-3 md:py-2 rounded-lg text-sm font-medium flex-1 md:flex-none text-center
              ${activeTab === 'create' 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'}`}
          >
            {/* Simplified text for mobile */}
            <span className="md:hidden">Create</span>
            <span className="hidden md:inline">Create Workout</span>
          </button>
        </div>
      </div>

      {activeTab === 'list' && (
        <WorkoutList onSelectWorkout={handleSelectWorkout} />
      )}

      {activeTab === 'detail' && selectedWorkout && (
        <div>
          <WorkoutDetail
            workout={selectedWorkout}
            onClose={() => handleTabChange('list')}
          />
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleStartWorkout}
              className="btn btn-primary min-w-40"
            >
              Start This Workout
            </button>
          </div>
        </div>
      )}

      {activeTab === 'create' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 md:block hidden">
            Create New Workout
          </h2>
          <WorkoutForm onComplete={() => handleTabChange('list')} />
        </div>
      )}

      {activeTab === 'active' && selectedWorkout && (
        <ActiveWorkout
          workout={selectedWorkout}
          onComplete={() => handleTabChange('list')}
        />
      )}
    </div>
  );
}