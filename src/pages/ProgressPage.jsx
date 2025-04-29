import React, { useState } from 'react';
import ProgressChart from '../components/stats/ProgressChart';
import HistoricalData from '../components/stats/HistoricalData';
import ExerciseProgress from '../components/stats/ExerciseProgress';
import WorkoutHistory from '../components/workouts/WorkoutHistory';

// Define available tabs and labels
const TABS = [
  { id: 'exercises', label: 'Exercises' },
  { id: 'history', label: 'Workout History' },
  { id: 'charts', label: 'Charts' },
  { id: 'data', label: 'Data' },
];

export default function ProgressPage() {
  const [activeTab, setActiveTab] = useState('history');

  // Render content based on the active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'exercises':
        return <ExerciseProgress />;
      case 'history':
        return <WorkoutHistory />;
      case 'charts':
        return <ProgressChart />;
      case 'data':
        return <HistoricalData />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-0">
          Progress Tracking
        </h1>
        <nav className="flex flex-wrap gap-2">
          {TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`btn ${
                activeTab === tab.id ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <div className="card p-6">
        {renderContent()}
      </div>
    </div>
  );
}
