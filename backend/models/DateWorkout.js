// models/DateWorkout.js
const mongoose = require('mongoose');

const dateWorkoutSchema = new mongoose.Schema({
  date: {
    type: String,  // Store as "YYYY-MM-DD" format
    required: true,
    index: true  // Add index for faster lookups
  },
  workouts: [{
    workoutId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workout',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      required: true
    }
  }]
}, { timestamps: true });

// Add compound index for more efficient queries
dateWorkoutSchema.index({ date: 1 });

module.exports = mongoose.models.DateWorkout || mongoose.model('DateWorkout', dateWorkoutSchema);