// netlify/functions/api.js

require('dotenv').config();
const express = require('express');
const serverless = require('serverless-http');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

// --- Define MongoDB schema directly ---
const scheduledWorkoutSchema = new mongoose.Schema({
  workoutId: {
    type: mongoose.Schema.Types.ObjectId,
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
});

const dayScheduleSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  },
  workouts: [scheduledWorkoutSchema]
});

const scheduleSchema = new mongoose.Schema({
  days: [dayScheduleSchema]
}, { timestamps: true });

// --- Error middleware (CommonJS) ---
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

// --- Async handler (CommonJS) ---
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Register models - only create if they don't exist yet
const Schedule = mongoose.models.Schedule || mongoose.model('Schedule', scheduleSchema);

// We need to define the workout model schemas here rather than importing
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

const Workout = mongoose.models.Workout || mongoose.model('Workout', workoutSchema);

// Performance model schema
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

const WorkoutPerformance = mongoose.models.WorkoutPerformance || mongoose.model('WorkoutPerformance', workoutPerformanceSchema);

// --- MongoDB Connection helper ---
async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
}

// --- Express app setup ---
const app = express();
const router = express.Router();

// Middleware: CORS & body parsing
app.use(cors({ origin: '*', credentials: true, methods: ['GET','POST','PUT','DELETE'], allowedHeaders: ['Content-Type','Authorization'] }));
app.use(bodyParser.json());

// --- Basic Auth middleware ---
const basicAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Basic ')) return res.status(401).json({ message: 'Authorization required' });
  try {
    const [user, pass] = Buffer.from(auth.split(' ')[1], 'base64').toString().split(':');
    if (user === process.env.AUTH_USERNAME && pass === process.env.AUTH_PASSWORD) return next();
    return res.status(401).json({ message: 'Invalid credentials' });
  } catch {
    return res.status(401).json({ message: 'Invalid authorization format' });
  }
};

// --- API Routes ---
router.get('/', (_req, res) => res.json({ message: 'API is running' }));

// Workouts
router.get('/workouts', basicAuth, asyncHandler(async (_req, res) => {
  const workouts = await Workout.find({});
  res.json(workouts);
}));

router.get('/workouts/:id', basicAuth, asyncHandler(async (req, res) => {
  const workout = await Workout.findById(req.params.id);

  if (workout) {
    res.json(workout);
  } else {
    res.status(404);
    throw new Error('Workout not found');
  }
}));

router.post('/workouts', basicAuth, asyncHandler(async (req, res) => {
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

router.put('/workouts/:id', basicAuth, asyncHandler(async (req, res) => {
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

router.delete('/workouts/:id', basicAuth, asyncHandler(async (req, res) => {
  const workout = await Workout.findById(req.params.id);

  if (workout) {
    await workout.deleteOne();
    res.json({ message: 'Workout removed' });
  } else {
    res.status(404);
    throw new Error('Workout not found');
  }
}));

// Schedule
router.get('/schedule', basicAuth, asyncHandler(async (_req, res) => {
  try {
    let schedule = await Schedule.findOne({});
    if (!schedule) {
      // Create default schedule if none exists
      schedule = await Schedule.create({
        days: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map(day => ({ 
          day, 
          workouts: [] 
        }))
      });
    }
    res.json(schedule);
  } catch (error) {
    console.error('Schedule get error:', error);
    res.status(500).json({ message: error.message });
  }
}));

router.put('/schedule', basicAuth, asyncHandler(async (req, res) => {
  try {
    const { days } = req.body;
    
    if (!days || !Array.isArray(days)) {
      return res.status(400).json({ message: 'Invalid request: days must be an array' });
    }
    
    // Validate each day has correct structure
    for (const day of days) {
      if (!day.day || !['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].includes(day.day)) {
        return res.status(400).json({ message: `Invalid day: ${day.day}` });
      }
      
      if (!Array.isArray(day.workouts)) {
        return res.status(400).json({ message: `Workouts must be an array for day: ${day.day}` });
      }
    }
    
    // Find existing schedule or create new one
    let schedule = await Schedule.findOne({});
    if (!schedule) {
      schedule = new Schedule();
    }
    
    // Update the schedule
    schedule.days = days;
    const updatedSchedule = await schedule.save();
    res.json(updatedSchedule);
  } catch (error) {
    console.error('Schedule update error:', error);
    res.status(500).json({ message: error.message, stack: error.stack });
  }
}));
router.get('/performance', basicAuth, asyncHandler(async (_req, res) => {
  const performances = await WorkoutPerformance.find({}).sort({ createdAt: -1 });
  res.json(performances);
}));

router.get('/performance/workout/:workoutId', basicAuth, asyncHandler(async (req, res) => {
  const performances = await WorkoutPerformance.find({ 
    workoutId: req.params.workoutId 
  }).sort({ createdAt: -1 });
  
  res.json(performances);
}));

router.get('/performance/:id', basicAuth, asyncHandler(async (req, res) => {
  const performance = await WorkoutPerformance.findById(req.params.id);

  if (performance) {
    res.json(performance);
  } else {
    res.status(404);
    throw new Error('Performance record not found');
  }
}));

router.post('/performance', basicAuth, asyncHandler(async (req, res) => {
  const { workoutId, exercises, duration, notes, completionStats } = req.body;

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
    notes,
    completionStats
  });

  const createdPerformance = await performance.save();
  res.status(201).json(createdPerformance);
}));

const dateWorkoutApi = {
  getByDate: (date) => fetchApi(`/dateworkouts/${date}`),
  getByDateRange: (startDate, endDate) => 
    fetchApi(`/dateworkouts/range?startDate=${startDate}&endDate=${endDate}`),
  updateByDate: (date, workouts) => 
    fetchApi(`/dateworkouts/${date}`, { 
      method: 'PUT', 
      body: JSON.stringify({ workouts }) 
    })
};
// Performance stats endpoints
router.get('/performance/stats/exercise/:exerciseName', basicAuth, asyncHandler(async (req, res) => {
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

router.get('/performance/stats/totals', basicAuth, asyncHandler(async (req, res) => {
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

// Auth verify
router.get('/auth/verify', basicAuth, (_req, res) => res.json({ message: 'Authentication valid' }));

// --- Mount routes then handlers ---
app.use('/.netlify/functions/api', router);
app.use(notFound);
app.use(errorHandler);

// --- Export Netlify handler ---
exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    // Ensure DB connection
    await connectDB();
    // Invoke the Express app via serverless-http
    const invoke = serverless(app);
    const response = await invoke(event, context);
    return response;
  } catch (err) {
    console.error('API error:', err);
    return {
      statusCode: err.statusCode || 500,
      body: JSON.stringify({ message: err.message, stack: err.stack })
    };
  }
};

const dateWorkoutSchema = new mongoose.Schema({
  date: {
    type: String,  // Format: YYYY-MM-DD
    required: true,
    index: true
  },
  workouts: [{
    workoutId: {
      type: mongoose.Schema.Types.ObjectId,
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

// Register model
const DateWorkout = mongoose.models.DateWorkout || mongoose.model('DateWorkout', dateWorkoutSchema);


// Date-specific workout routes - IMPORTANT: ORDER MATTERS HERE
// The 'range' route must be defined BEFORE the '/:date' route
router.get('/dateworkouts/range', basicAuth, asyncHandler(async (req, res) => {
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
}));

router.get('/dateworkouts/:date', basicAuth, asyncHandler(async (req, res) => {
  const { date } = req.params;
  
  const dateWorkout = await DateWorkout.findOne({ date });
  
  if (dateWorkout) {
    res.json(dateWorkout.workouts);
  } else {
    res.json([]);
  }
}));

router.put('/dateworkouts/:date', basicAuth, asyncHandler(async (req, res) => {
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
}));