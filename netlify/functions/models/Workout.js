// netlify/functions/models/Workout.js
const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  sets: {
    type: Number,
    required: true,
    default: 3,
  },
  reps: {
    type: Number,
    required: true,
    default: 10,
  },
  weight: {
    type: Number,
    required: true,
    default: 0,
  },
});

const workoutSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['strength', 'cardio', 'hiit', 'flexibility', 'mixed'],
      default: 'strength',
    },
    duration: {
      type: Number,
      required: true,
      default: 45,
    },
    exercises: [exerciseSchema],
    notes: {
      type: String,
      default: '',
    }
  },
  {
    timestamps: true,
  }
);

// Check if the model already exists to prevent recompilation errors
module.exports = mongoose.models.Workout || mongoose.model('Workout', workoutSchema);