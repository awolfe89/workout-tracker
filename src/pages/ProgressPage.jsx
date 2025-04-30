import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProgressChart from '../components/stats/ProgressChart';
import HistoricalData from '../components/stats/HistoricalData';
import ExerciseProgress from '../components/stats/ExerciseProgress';
import WorkoutHistory from '../components/workouts/WorkoutHistory';

// Define available tabs and their routes
const TABS = [
  { id: 'exercises', label: 'Exercises', path: '/stats/exercises' },
  { id: 'history', label: 'Workout History', path: '/stats/history' },
  { id: 'charts', label: 'Charts', path: '/stats/charts' },
  { id: 'data', label: 'Data', path: '/stats/data' }
];

export default function ProgressPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('history');

  // Sync tab when the URL changes
  useEffect(() => {
    const match = TABS.find(tab => tab.path === location.pathname);
    setActiveTab(match ? match.id : 'history');
  }, [location.pathname]);

  // When user clicks a tab, update both state and URL
  const handleTabClick = (tab) => {
    setActiveTab(tab.id);
    navigate(tab.path);
  };

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
              onClick={() => handleTabClick(tab)}
              className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
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
