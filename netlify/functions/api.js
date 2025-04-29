// netlify/functions/api.js
const express = require('express');
const serverless = require('serverless-http');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

// Import your models directly to avoid separate file imports
const Workout = require('./models/Workout');
const Schedule = require('./models/Schedule');
const WorkoutPerformance = require('./models/WorkoutPerformance');

// Create express app
const app = express();
const router = express.Router();

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return false;
  }
  return true;
};

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());

// Basic Auth Middleware
const basicAuth = (req, res, next) => {
  // Get auth header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({ message: 'Authorization required' });
  }
  
  try {
    // Get credentials from header
    const base64Credentials = authHeader.substring(6);
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf8');
    const [username, password] = credentials.split(':');
    
    // Check credentials against environment variables
    if (
      username === process.env.AUTH_USERNAME && 
      password === process.env.AUTH_PASSWORD
    ) {
      return next();
    }
    
    // Authentication failed
    return res.status(401).json({ message: 'Invalid credentials' });
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ message: 'Invalid authorization format' });
  }
};

// API routes
router.get('/', (req, res) => {
  res.json({
    message: 'API is running'
  });
});

// Workout routes
router.get('/workouts', basicAuth, async (req, res) => {
  try {
    const workouts = await Workout.find({});
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/workouts', basicAuth, async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/workouts/:id', basicAuth, async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);
    if (workout) {
      res.json(workout);
    } else {
      res.status(404).json({ message: 'Workout not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/workouts/:id', basicAuth, async (req, res) => {
  try {
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
      res.status(404).json({ message: 'Workout not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/workouts/:id', basicAuth, async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);
    if (workout) {
      await workout.deleteOne();
      res.json({ message: 'Workout removed' });
    } else {
      res.status(404).json({ message: 'Workout not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Schedule routes
router.get('/schedule', basicAuth, async (req, res) => {
  try {
    let schedule = await Schedule.findOne({});
    
    if (!schedule) {
      const days = [
        'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
      ].map(day => ({
        day,
        workouts: []
      }));
      
      schedule = await Schedule.create({ days });
    }
    
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/schedule', basicAuth, async (req, res) => {
  try {
    const { days } = req.body;
    let schedule = await Schedule.findOne({});
    
    if (schedule) {
      schedule.days = days;
      const updatedSchedule = await schedule.save();
      res.json(updatedSchedule);
    } else {
      schedule = new Schedule({
        days
      });
      
      const createdSchedule = await schedule.save();
      res.status(201).json(createdSchedule);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Performance routes
router.get('/performance', basicAuth, async (req, res) => {
  try {
    const performances = await WorkoutPerformance.find({}).sort({ createdAt: -1 });
    res.json(performances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/performance', basicAuth, async (req, res) => {
  try {
    const { workoutId, exercises, duration, notes } = req.body;
    
    const workout = await Workout.findById(workoutId);
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    
    const performance = new WorkoutPerformance({
      workoutId,
      workoutName: workout.name,
      exercises,
      duration,
      notes
    });
    
    const createdPerformance = await performance.save();
    res.status(201).json(createdPerformance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Auth verification endpoint
router.get('/auth/verify', basicAuth, (req, res) => {
  res.status(200).json({ message: 'Authentication successful' });
});

// Error handling middleware
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

app.use(notFound);
app.use(errorHandler);

// Apply the routes to our application with a base
app.use('/.netlify/functions/api', router);

// Define Mongoose models inline for the function
// Workout Model
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
    exercises: [
      {
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
      }
    ],
    notes: {
      type: String,
      default: '',
    }
  },
  {
    timestamps: true,
  }
);

// Connect to DB when the function is invoked
exports.handler = async (event, context) => {
  // Make sure we don't timeout waiting for mongoose
  context.callbackWaitsForEmptyEventLoop = false;
  
  // Connect to MongoDB if not already connected
  if (mongoose.connection.readyState !== 1) {
    await connectDB();
  }
  
  // Process the serverless request
  const handler = serverless(app);
  return handler(event, context);
};