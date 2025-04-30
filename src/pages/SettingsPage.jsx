import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { scheduleApi, clearCredentials } from '../services/api';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Load the schedule on mount
  useEffect(() => {
    const loadSchedule = async () => {
      try {
        const data = await scheduleApi.get();
        setSchedule(data);
      } catch (err) {
        if (err.message.startsWith('Unauthorized')) {
          // Redirect to login on 401
          clearCredentials();
          navigate('/login', { replace: true });
        } else {
          console.error('Error loading schedule:', err);
          setError('Failed to load schedule.');
        }
      }
    };
    loadSchedule();
  }, [navigate]);

  // Handler to save updated schedule
  const handleSave = async (updatedDays) => {
    setSaving(true);
    try {
      const updated = await scheduleApi.update({ days: updatedDays });
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

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }
  if (!schedule) {
    return <div className="p-4">Loading schedule…</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Your Weekly Schedule</h1>

      {schedule.days.map((dayObj, idx) => (
        <div key={dayObj.day} className="border p-4 rounded">
          <h2 className="font-semibold mb-2">{dayObj.day}</h2>
          {/* Example: list out checkboxes or selects for workouts */}
          {/* For brevity, assume you have a DayEditor component */}
          <DayEditor
            workouts={dayObj.workouts}
            onChange={(newWorkouts) => {
              const newDays = [...schedule.days];
              newDays[idx] = { ...dayObj, workouts: newWorkouts };
              setSchedule({ ...schedule, days: newDays });
            }}
          />
        </div>
      ))}

      <button
        className="btn btn-primary"
        onClick={() => handleSave(schedule.days)}
        disabled={saving}
      >
        {saving ? 'Saving…' : 'Save Schedule'}
      </button>
    </div>
  );
}
