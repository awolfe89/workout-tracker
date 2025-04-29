import WorkoutCalendar from '../components/workouts/WorkoutCalendar';

export default function SchedulePage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Workout Schedule</h1>
      </div>
      
      <div className="card p-6">
        <WorkoutCalendar />
      </div>
    </div>
  );
}