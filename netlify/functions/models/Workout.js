import mongoose from 'mongoose';

const exerciseSchema = mongoose.Schema({
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

const workoutSchema = mongoose.Schema(
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

// Check if the model already exists
const Workout = mongoose.models.Workout || mongoose.model('Workout', workoutSchema);

export default Workout;