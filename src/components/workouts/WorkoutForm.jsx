import { useState } from 'react';
import { useWorkout } from '../../context/WorkoutContext';
import { toast } from 'react-hot-toast';

export default function WorkoutForm({ initialData = null, onComplete }) {
  const { addWorkout, updateWorkout, loading } = useWorkout();
  const isEditMode = !!initialData;
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'strength',
    duration: 45,
    exercises: [{ name: '', sets: 3, reps: 10, weight: 0 }],
    notes: '',
    ...initialData,
  });
  
  const [errors, setErrors] = useState({});
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Workout name is required';
    }
    
    if (formData.exercises.length === 0) {
      newErrors.exercises = 'At least one exercise is required';
    } else {
      formData.exercises.forEach((exercise, index) => {
        if (!exercise.name.trim()) {
          newErrors[`exercise_${index}_name`] = 'Exercise name is required';
        }
      });
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleExerciseChange = (index, field, value) => {
    setFormData(prev => {
      const updatedExercises = [...prev.exercises];
      updatedExercises[index] = { 
        ...updatedExercises[index], 
        [field]: field === 'name' ? value : Number(value) 
      };
      return { ...prev, exercises: updatedExercises };
    });
  };
  
  const addExercise = () => {
    setFormData(prev => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        { name: '', sets: 3, reps: 10, weight: 0 }
      ]
    }));
  };
  
  const removeExercise = (index) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    try {
      if (isEditMode) {
        await updateWorkout(initialData._id, formData);
        toast.success('Workout updated successfully');
      } else {
        await addWorkout(formData);
        toast.success('Workout created successfully');
      }
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      toast.error('Failed to save workout. Please try again.');
      console.error('Error saving workout:', error);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="label">
          Workout Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`input ${errors.name ? 'border-red-500' : ''}`}
          placeholder="e.g. Full Body Strength"
          disabled={loading}
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>
      
      <div>
        <label htmlFor="type" className="label">
          Workout Type
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="input"
          disabled={loading}
        >
          <option value="strength">Strength</option>
          <option value="cardio">Cardio</option>
          <option value="hiit">HIIT</option>
          <option value="flexibility">Flexibility</option>
          <option value="mixed">Mixed</option>
        </select>
      </div>
      
      <div>
        <label htmlFor="duration" className="label">
          Duration (minutes)
        </label>
        <input
          type="number"
          id="duration"
          name="duration"
          value={formData.duration}
          onChange={handleChange}
          min="1"
          max="300"
          className="input"
          disabled={loading}
        />
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="label">Exercises</label>
          <button
            type="button"
            onClick={addExercise}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            disabled={loading}
          >
            + Add Exercise
          </button>
        </div>
        
        {errors.exercises && (
          <p className="mt-1 text-sm text-red-600">{errors.exercises}</p>
        )}
        
        <div className="space-y-3">
          {formData.exercises.map((exercise, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-md p-4 bg-white dark:bg-gray-800">
              <div className="flex justify-between">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Exercise {index + 1}
                </h4>
                {formData.exercises.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeExercise(index)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm"
                    disabled={loading}
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label htmlFor={`exercise-${index}-name`} className="label">
                    Exercise Name
                  </label>
                  <input
                    type="text"
                    id={`exercise-${index}-name`}
                    value={exercise.name}
                    onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                    className={`input ${errors[`exercise_${index}_name`] ? 'border-red-500' : ''}`}
                    placeholder="e.g. Bench Press"
                    disabled={loading}
                  />
                  {errors[`exercise_${index}_name`] && (
                    <p className="mt-1 text-sm text-red-600">{errors[`exercise_${index}_name`]}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor={`exercise-${index}-sets`} className="label">
                    Sets
                  </label>
                  <input
                    type="number"
                    id={`exercise-${index}-sets`}
                    value={exercise.sets}
                    onChange={(e) => handleExerciseChange(index, 'sets', e.target.value)}
                    min="1"
                    max="20"
                    className="input"
                    disabled={loading}
                  />
                </div>
                
                <div>
                  <label htmlFor={`exercise-${index}-reps`} className="label">
                    Reps
                  </label>
                  <input
                    type="number"
                    id={`exercise-${index}-reps`}
                    value={exercise.reps}
                    onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)}
                    min="1"
                    max="100"
                    className="input"
                    disabled={loading}
                  />
                </div>
                
                <div className="col-span-2">
                <label htmlFor={`exercise-${index}-weight`} className="label">
                   Weight (lbs)
                </label>
                  <input
                    type="number"
                    id={`exercise-${index}-weight`}
                    value={exercise.weight}
                    onChange={(e) => handleExerciseChange(index, 'weight', e.target.value)}
                    min="0"
                    max="1000"
                    step="0.5"
                    className="input"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <label htmlFor="notes" className="label">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows="3"
          className="input"
          placeholder="Additional notes about this workout..."
          disabled={loading}
        />
      </div>
      
      <div className="flex justify-end space-x-3">
        {onComplete && (
          <button
            type="button"
            onClick={onComplete}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
        )}
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {isEditMode ? 'Updating...' : 'Creating...'}
            </span>
          ) : (
            isEditMode ? 'Update Workout' : 'Create Workout'
          )}
        </button>
      </div>
    </form>
  );
}