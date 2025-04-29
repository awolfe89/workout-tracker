// netlify/functions/models/WorkoutPerformance.js
const mongoose = require('mongoose');

const setPerformanceSchema = new mongoose.Schema({
  setNumber: {
    type: Number,
    required: true,
  },
  weight: {
    type: Number,
    required: true,
    default: 0,
  },
  reps: {
    type: Number,
    required: true,
    default: 0,
  },
  notes: {
    type: String,
  }
});

const exercisePerformanceSchema = new mongoose.Schema({
  exerciseName: {
    type: String,
    required: true,
  },
  sets: [setPerformanceSchema],
  totalWeight: {
    type: Number,
    default: 0
  },
  totalReps: {
    type: Number,
    default: 0
  }
});

const workoutPerformanceSchema = new mongoose.Schema(
  {
    workoutId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workout',
      required: true,
    },
    workoutName: {
      type: String,
      required: true,
    },
    exercises: [exercisePerformanceSchema],
    totalWeight: {
      type: Number,
      default: 0
    },
    totalReps: {
      type: Number,
      default: 0
    },
    duration: {
      type: Number,
      required: true,
      default: 0,
    },
    notes: {
      type: String,
    }
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to calculate totals
workoutPerformanceSchema.pre('save', function(next) {
  let totalWeight = 0;
  let totalReps = 0;
  
  this.exercises.forEach(exercise => {
    let exerciseTotalWeight = 0;
    let exerciseTotalReps = 0;
    
    exercise.sets.forEach(set => {
      exerciseTotalWeight += set.weight * set.reps;
      exerciseTotalReps += set.reps;
    });
    
    // Update exercise totals
    exercise.totalWeight = exerciseTotalWeight;
    exercise.totalReps = exerciseTotalReps;
    
    // Add to workout totals
    totalWeight += exerciseTotalWeight;
    totalReps += exerciseTotalReps;
  });
  
  // Update workout totals
  this.totalWeight = totalWeight;
  this.totalReps = totalReps;
  
  next();
});

// Check if the model already exists to prevent recompilation errors
module.exports = mongoose.models.WorkoutPerformance || mongoose.model('WorkoutPerformance', workoutPerformanceSchema);