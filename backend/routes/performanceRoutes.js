// routes/performanceRoutes.js
const express = require('express');
const WorkoutPerformance = require('../models/WorkoutPerformance');
const Workout = require('../models/Workout');
const router = express.Router();

// Helper to handle async errors
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// @desc    Get all workout performances
// @route   GET /api/performance
router.get('/', asyncHandler(async (req, res) => {
  const performances = await WorkoutPerformance.find({}).sort({ createdAt: -1 });
  res.json(performances);
}));

// @desc    Get workout performances by workout ID
// @route   GET /api/performance/workout/:workoutId
router.get('/workout/:workoutId', asyncHandler(async (req, res) => {
  const performances = await WorkoutPerformance.find({ 
    workoutId: req.params.workoutId 
  }).sort({ createdAt: -1 });
  
  res.json(performances);
}));

// @desc    Get a single performance record
// @route   GET /api/performance/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const performance = await WorkoutPerformance.findById(req.params.id);

  if (performance) {
    res.json(performance);
  } else {
    res.status(404);
    throw new Error('Performance record not found');
  }
}));

// @desc    Create a new workout performance
// @route   POST /api/performance
router.post('/', asyncHandler(async (req, res) => {
  const { workoutId, exercises, duration, notes } = req.body;

  // Get the workout name
  const workout = await Workout.findById(workoutId);
  if (!workout) {
    res.status(404);
    throw new Error('Workout not found');
  }

  const workoutName = workout.name;

  const performance = new WorkoutPerformance({
    workoutId,
    workoutName,
    exercises,
    duration,
    notes
  });

  const createdPerformance = await performance.save();
  res.status(201).json(createdPerformance);
}));

// @desc    Update a workout performance
// @route   PUT /api/performance/:id
router.put('/:id', asyncHandler(async (req, res) => {
  const { exercises, duration, notes } = req.body;

  const performance = await WorkoutPerformance.findById(req.params.id);

  if (performance) {
    performance.exercises = exercises || performance.exercises;
    performance.duration = duration || performance.duration;
    performance.notes = notes !== undefined ? notes : performance.notes;

    const updatedPerformance = await performance.save();
    res.json(updatedPerformance);
  } else {
    res.status(404);
    throw new Error('Performance record not found');
  }
}));

// @desc    Delete a workout performance
// @route   DELETE /api/performance/:id
router.delete('/:id', asyncHandler(async (req, res) => {
  const performance = await WorkoutPerformance.findById(req.params.id);

  if (performance) {
    await performance.deleteOne();
    res.json({ message: 'Performance record removed' });
  } else {
    res.status(404);
    throw new Error('Performance record not found');
  }
}));

// @desc    Get exercise stats (weight, reps over time)
// @route   GET /api/performance/stats/exercise/:exerciseName
router.get('/stats/exercise/:exerciseName', asyncHandler(async (req, res) => {
  const { exerciseName } = req.params;
  
  // Find all performances that include this exercise
  const performances = await WorkoutPerformance.find({
    'exercises.exerciseName': exerciseName
  }).sort({ createdAt: 1 });
  
  // Extract stats for this exercise over time
  const stats = performances.map(perf => {
    const exercise = perf.exercises.find(ex => ex.exerciseName === exerciseName);
    
    if (!exercise) return null;
    
    // Calculate max weight and average weight
    let maxWeight = 0;
    let totalWeight = 0;
    let totalSets = exercise.sets.length;
    
    exercise.sets.forEach(set => {
      if (set.weight > maxWeight) maxWeight = set.weight;
      totalWeight += set.weight;
    });
    
    const avgWeight = totalSets > 0 ? totalWeight / totalSets : 0;
    
    return {
      date: perf.createdAt,
      totalReps: exercise.totalReps,
      totalWeight: exercise.totalWeight,
      maxWeight,
      avgWeight,
      sets: exercise.sets
    };
  }).filter(Boolean);
  
  res.json(stats);
}));

// @desc    Get total stats (total volume over time)
// @route   GET /api/performance/stats/totals
router.get('/stats/totals', asyncHandler(async (req, res) => {
  // Get performances grouped by day
  const performances = await WorkoutPerformance.aggregate([
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        totalWeight: { $sum: '$totalWeight' },
        totalReps: { $sum: '$totalReps' },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  
  res.json(performances);
}));

module.exports = router;