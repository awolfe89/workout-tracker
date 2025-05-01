// controllers/dateWorkoutController.js
const asyncHandler = require('express-async-handler');
const DateWorkout = require('../models/DateWorkout');

// Get workouts for a specific date
const getWorkoutsByDate = asyncHandler(async (req, res) => {
  const { date } = req.params;
  
  const dateWorkout = await DateWorkout.findOne({ date });
  
  if (dateWorkout) {
    res.json(dateWorkout.workouts);
  } else {
    res.json([]);
  }
});

// Get workouts for a date range
const getWorkoutsByDateRange = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  if (!startDate || !endDate) {
    res.status(400);
    throw new Error('Start date and end date are required');
  }
  
  const dateWorkouts = await DateWorkout.find({
    date: { $gte: startDate, $lte: endDate }
  });
  
  // Transform to a map for easier client-side processing
  const workoutsByDate = {};
  dateWorkouts.forEach(dw => {
    workoutsByDate[dw.date] = dw.workouts;
  });
  
  res.json(workoutsByDate);
});

// Update workouts for a specific date
const updateWorkoutsByDate = asyncHandler(async (req, res) => {
  const { date } = req.params;
  const { workouts } = req.body;
  
  if (!Array.isArray(workouts)) {
    res.status(400);
    throw new Error('Workouts must be an array');
  }
  
  let dateWorkout = await DateWorkout.findOne({ date });
  
  if (dateWorkout) {
    dateWorkout.workouts = workouts;
    const updatedDateWorkout = await dateWorkout.save();
    res.json(updatedDateWorkout.workouts);
  } else {
    // Create new date workout entry
    dateWorkout = new DateWorkout({
      date,
      workouts
    });
    
    const newDateWorkout = await dateWorkout.save();
    res.status(201).json(newDateWorkout.workouts);
  }
});

module.exports = {
  getWorkoutsByDate,
  getWorkoutsByDateRange,
  updateWorkoutsByDate
};