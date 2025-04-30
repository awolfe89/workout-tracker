import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { scheduleApi, clearCredentials } from '../services/api';
import { WorkoutContext } from '../context/WorkoutContext';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { workouts } = useContext(WorkoutContext);
  const [schedule, setSchedule] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Load schedule on mount
  useEffect(() => {
    async function loadSchedule() {
      try {
        const data = await scheduleApi.get();
        setSchedule(data);
      } catch (err) {
        if (err.message.startsWith('Unauthorized')) {
          clearCredentials();
          navigate('/login', { replace: true });
        } else {
          console.error('Error loading schedule:', err);
          setError('Failed to load schedule.');
        }
      }
    }
    loadSchedule();
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
  if (!schedule) return <div className="p-4">Loading schedule…</div>;

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
