import React, { useState } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import ErrorBanner from '../components/ErrorBanner';
import WorkoutList from '../components/workouts/WorkoutList';
import WorkoutDetail from '../components/workouts/WorkoutDetail';
import WorkoutForm from '../components/workouts/WorkoutForm';
import ActiveWorkout from '../components/workouts/ActiveWorkout';

export default function WorkoutsPage() {
  const { error, setActiveWorkout } = useWorkout();
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
      // Set the active workout in context
      setActiveWorkout(selectedWorkout);
      setActiveTab('active');
    }
  };

  return (
    <div className="space-y-6">
      {error && <ErrorBanner message={error} />}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Workouts</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => handleTabChange('list')}
            className={`btn ${activeTab === 'list' ? 'btn-primary' : 'btn-secondary'}`}
          >
            All Workouts
          </button>
          <button
            onClick={() => handleTabChange('create')}
            className={`btn ${activeTab === 'create' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Create Workout
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
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Create New Workout
          </h2>
          <WorkoutForm onComplete={() => handleTabChange('list')} />
        </div>
      )}

      {activeTab === 'active' && (
        <ActiveWorkout
          onComplete={() => handleTabChange('list')}
        />
      )}
    </div>
  );
}