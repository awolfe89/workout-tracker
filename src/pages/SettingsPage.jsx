import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { scheduleApi, workoutApi, clearCredentials, isAuthenticated } from '../services/api';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState([]);
  const [schedule, setSchedule] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // Load both schedule and workouts on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [sched, wts] = await Promise.all([
          scheduleApi.get(),
          workoutApi.getAll()
        ]);
        setSchedule(sched);
        setWorkouts(wts);
      } catch (err) {
        if (err.message.startsWith('Unauthorized')) {
          clearCredentials();
          navigate('/login', { replace: true });
        } else {
          console.error('Error loading data:', err);
          setError('Failed to load schedule or workouts.');
        }
      }
    }
    loadData();
  }, [navigate]);

  const handleWorkoutsChange = (dayIndex, selectedIds) => {
    setSchedule(prev => {
      const days = [...prev.days];
      days[dayIndex].workouts = selectedIds;
      return { ...prev, days };
    });
  };

  const handleSave = async () => {
    if (!schedule) return;
    setSaving(true);
    try {
      const updated = await scheduleApi.update({ days: schedule.days });
      setSchedule(updated);
      setError(null);
    } catch (err) {
      if (err.message.startsWith('Unauthorized')) {
        clearCredentials();
        navigate('/login', { replace: true });
      } else {
        console.error('Error saving schedule:', err);
        setError('Failed to save schedule.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!schedule || workouts.length === 0) {
    return <div className="p-4">Loading schedule & workouts…</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Weekly Workout Schedule</h1>

      {schedule.days.map((dayObj, idx) => (
        <div key={dayObj.day} className="border rounded p-4">
          <h2 className="font-semibold mb-2">{dayObj.day}</h2>
          <select
            multiple
            value={dayObj.workouts}
            onChange={e => handleWorkoutsChange(
              idx,
              Array.from(e.target.selectedOptions, o => o.value)
            )}
            className="w-full h-32 border rounded p-2"
          >
            {workouts.map(w => (
              <option key={w._id || w.id} value={w._id || w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
      ))}

      <button
        className="btn btn-primary"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? 'Saving…' : 'Save Schedule'}
      </button>
    </div>
  );
}
