import { useWorkout } from '../../context/WorkoutContext';
import WorkoutForm from './WorkoutForm';
import { useState } from 'react';

export default function WorkoutDetail({ workout, onClose }) {
  const [isEditing, setIsEditing] = useState(false);
  
  if (isEditing) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edit Workout
          </h2>
          <button
            onClick={() => setIsEditing(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            Cancel
          </button>
        </div>
        
        <WorkoutForm
          initialData={workout}
          onComplete={() => {
            setIsEditing(false);
          }}
        />
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {workout.name}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsEditing(true)}
            className="btn btn-secondary"
          >
            Edit
          </button>
          <button
            onClick={onClose}
            className="btn btn-secondary"
          >
            Close
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-4 md:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Exercises
          </h3>
          
          <div className="space-y-4">
            {workout.exercises.map((exercise, index) => (
              <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0 last:pb-0">
                <h4 className="font-medium text-gray-800 dark:text-gray-200">
                  {exercise.name}
                </h4>
                <div className="mt-2 grid grid-cols-3 gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <div>
                    <span className="font-medium">Sets:</span> {exercise.sets}
                  </div>
                  <div>
                    <span className="font-medium">Reps:</span> {exercise.reps}
                  </div>
                  <div>
                  <span className="font-medium">Weight:</span> {exercise.weight} {exercise.weight === 1 ? 'lb' : 'lbs'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="card p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Details
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Type:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {workout.type.charAt(0).toUpperCase() + workout.type.slice(1)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {workout.duration} minutes
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Exercises:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {workout.exercises.length}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Created:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {new Date(workout.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              {workout.updatedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Last Updated:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(workout.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {workout.notes && (
            <div className="card p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Notes
              </h3>
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line text-sm">
                {workout.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}