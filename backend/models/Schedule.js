// models/Schedule.js
const mongoose = require('mongoose');

const scheduledWorkoutSchema = mongoose.Schema({
  workoutId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workout',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
});

const dayScheduleSchema = mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  },
  workouts: [scheduledWorkoutSchema],
});

const scheduleSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Not requiring user authentication for now
    },
    days: [dayScheduleSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Schedule || mongoose.model('Schedule', scheduleSchema);