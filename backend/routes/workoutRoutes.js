// routes/workoutRoutes.js
const express = require('express');
const Workout = require('../models/Workout');
const router = express.Router();

// Helper to handle async errors
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// @desc    Get all workouts
// @route   GET /api/workouts
router.get('/', asyncHandler(async (req, res) => {
  const workouts = await Workout.find({});
  res.json(workouts);
}));

// @desc    Get workout by ID
// @route   GET /api/workouts/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const workout = await Workout.findById(req.params.id);

  if (workout) {
    res.json(workout);
  } else {
    res.status(404);
    throw new Error('Workout not found');
  }
}));

// @desc    Create a new workout
// @route   POST /api/workouts
router.post('/', asyncHandler(async (req, res) => {
  const { name, type, duration, exercises, notes } = req.body;

  const workout = new Workout({
    name,
    type,
    duration,
    exercises,
    notes,
  });

  const createdWorkout = await workout.save();
  res.status(201).json(createdWorkout);
}));

// @desc    Update a workout
// @route   PUT /api/workouts/:id
router.put('/:id', asyncHandler(async (req, res) => {
  const { name, type, duration, exercises, notes } = req.body;

  const workout = await Workout.findById(req.params.id);

  if (workout) {
    workout.name = name || workout.name;
    workout.type = type || workout.type;
    workout.duration = duration || workout.duration;
    workout.exercises = exercises || workout.exercises;
    workout.notes = notes !== undefined ? notes : workout.notes;

    const updatedWorkout = await workout.save();
    res.json(updatedWorkout);
  } else {
    res.status(404);
    throw new Error('Workout not found');
  }
}));

// @desc    Delete a workout
// @route   DELETE /api/workouts/:id
router.delete('/:id', asyncHandler(async (req, res) => {
  const workout = await Workout.findById(req.params.id);

  if (workout) {
    await workout.deleteOne();
    res.json({ message: 'Workout removed' });
  } else {
    res.status(404);
    throw new Error('Workout not found');
  }
}));

module.exports = router;