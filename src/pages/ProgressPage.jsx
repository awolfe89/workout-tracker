import { useState } from 'react';
import ProgressChart from '../components/stats/ProgressChart';
import HistoricalData from '../components/stats/HistoricalData';
import ExerciseProgress from '../components/stats/ExerciseProgress';
import WorkoutHistory from '../components/workouts/WorkoutHistory';

export default function ProgressPage() {
  const [activeTab, setActiveTab] = useState('history');
  
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-0">Progress Tracking</h1>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('exercises')}
            className={`btn ${activeTab === 'exercises' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Exercises
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Workout History
          </button>
          <button
            onClick={() => setActiveTab('charts')}
            className={`btn ${activeTab === 'charts' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Charts
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`btn ${activeTab === 'data' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Data
          </button>
        </div>
      </div>
      
      <div className="card p-6">
        {activeTab === 'exercises' ? (
          <ExerciseProgress />
        ) : activeTab === 'history' ? (
          <WorkoutHistory />
        ) : activeTab === 'charts' ? (
          <ProgressChart />
        ) : (
          <HistoricalData />
        )}
      </div>
    </div>
  );
}