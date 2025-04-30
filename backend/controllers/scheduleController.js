import asyncHandler from 'express-async-handler';
import Schedule from '../models/Schedule.js';

// @desc    Get schedule
// @route   GET /api/schedule
// @access  Public
const getSchedule = asyncHandler(async (req, res) => {
  let schedule = await Schedule.findOne({});

  // If no schedule exists yet, create a default one
  if (!schedule) {
    const days = [
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    ].map(day => ({
      day,
      workouts: []
    }));

    schedule = await Schedule.create({
      days
    });
  }

  res.json(schedule);
});

// @desc    Update schedule
// @route   PUT /api/schedule
// @access  Public
const updateSchedule = asyncHandler(async (req, res) => {
  const { days } = req.body;

  let schedule = await Schedule.findOne({});

  if (schedule) {
    // Ensure days is properly formatted
    if (Array.isArray(days)) {
      schedule.days = days;
      const updatedSchedule = await schedule.save();
      res.json(updatedSchedule);
    } else {
      res.status(400);
      throw new Error('Days must be an array');
    }
  } else {
    // Create a new schedule if one doesn't exist
    if (!Array.isArray(days)) {
      res.status(400);
      throw new Error('Days must be an array');
    }

    schedule = new Schedule({
      days
    });

    const createdSchedule = await schedule.save();
    res.status(201).json(createdSchedule);
  }
});

// @desc    Update specific day in schedule
// @route   PUT /api/schedule/:day
// @access  Public
const updateScheduleDay = asyncHandler(async (req, res) => {
  const { workouts } = req.body;
  const day = req.params.day;

  // Validate day parameter
  const validDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  if (!validDays.includes(day)) {
    res.status(400);
    throw new Error(`Invalid day: ${day}`);
  }

  // Validate workouts array
  if (!Array.isArray(workouts)) {
    res.status(400);
    throw new Error('Workouts must be an array');
  }

  let schedule = await Schedule.findOne({});

  if (!schedule) {
    // Create a default schedule if one doesn't exist
    const days = validDays.map(d => ({
      day: d,
      workouts: d === day ? workouts : []
    }));

    schedule = await Schedule.create({
      days
    });
    
    res.status(201).json(schedule);
  } else {
    // Find the day in the schedule and update it
    const dayIndex = schedule.days.findIndex(d => d.day === day);

    if (dayIndex !== -1) {
      schedule.days[dayIndex].workouts = workouts;
      const updatedSchedule = await schedule.save();
      res.json(updatedSchedule);
    } else {
      res.status(404);
      throw new Error(`Day ${day} not found in schedule`);
    }
  }
});

export {
  getSchedule,
  updateSchedule,
  updateScheduleDay
};