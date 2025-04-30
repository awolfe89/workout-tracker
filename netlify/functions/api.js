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

// Register models
const Schedule = mongoose.models.Schedule || mongoose.model('Schedule', scheduleSchema);
const Workout = mongoose.models.Workout || mongoose.model('Workout', require('./models/Workout'));
const WorkoutPerformance = mongoose.models.WorkoutPerformance || mongoose.model('WorkoutPerformance', require('./models/WorkoutPerformance'));

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

// Schedule
router.get('/schedule', basicAuth, async (_req, res) => {
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
});

router.put('/schedule', basicAuth, async (req, res) => {
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
      
      // Validate each workout
      for (const workout of day.workouts) {
        if (!workout.workoutId || !workout.name || !workout.type || workout.duration === undefined) {
          return res.status(400).json({ 
            message: 'Each workout must have workoutId, name, type, and duration',
            workout
          });
        }
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
});

// Auth verify
router.get('/auth/verify', basicAuth, (_req, res) => res.json({ message: 'Authentication valid' }));

// --- Mount routes then handlers ---
app.use('/.netlify/functions/api', router);
app.use((req, res, next) => { res.status(404); next(new Error('Not Found - ' + req.originalUrl)); });
app.use((err, _req, res, _next) => { 
  console.error('API error:', err);
  const code = res.statusCode === 200 ? 500 : res.statusCode; 
  res.status(code).json({ 
    message: err.message, 
    stack: process.env.NODE_ENV === 'production' ? null : err.stack 
  }); 
});

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