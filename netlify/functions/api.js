// netlify/functions/api.js

require('dotenv').config();
const express = require('express');
const serverless = require('serverless-http');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

// --- Inline Mongoose schema definitions ---
const workoutSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true, enum: ['strength','cardio','hiit','flexibility','mixed'], default: 'strength' },
  duration: { type: Number, required: true, default: 45 },
  exercises: [
    {
      name: { type: String, required: true },
      sets: { type: Number, required: true, default: 3 },
      reps: { type: Number, required: true, default: 10 },
      weight: { type: Number, required: true, default: 0 },
      rest: { type: Number, default: 30 },
      notes: { type: String, default: '' }
    }
  ],
  notes: { type: String, default: '' }
}, { timestamps: true });

const scheduleSchema = new mongoose.Schema({
  days: [
    { day: { type: String, required: true }, workouts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Workout' }] }
  ]
}, { timestamps: true });

const performanceSchema = new mongoose.Schema({
  workoutId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Workout' },
  workoutName: { type: String, required: true },
  exercises: [
    { name: { type: String, required: true }, sets: { type: Number, required: true }, reps: { type: Number, required: true }, weight: { type: Number, required: true }, notes: { type: String } }
  ],
  duration: { type: Number, required: true },
  notes: { type: String, default: '' }
}, { timestamps: true });

// Register or reuse models
const Workout = mongoose.models.Workout || mongoose.model('Workout', workoutSchema);
const Schedule = mongoose.models.Schedule || mongoose.model('Schedule', scheduleSchema);
const WorkoutPerformance = mongoose.models.WorkoutPerformance || mongoose.model('WorkoutPerformance', performanceSchema);

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
router.get('/workouts', basicAuth, async (_req, res) => res.json(await Workout.find({})));  
router.get('/workouts/:id', basicAuth, async (req, res) => {
  const w = await Workout.findById(req.params.id);
  return w ? res.json(w) : res.status(404).json({ message: 'Workout not found' });
});
router.post('/workouts', basicAuth, async (req, res) => res.status(201).json(await new Workout(req.body).save()));
router.put('/workouts/:id', basicAuth, async (req, res) => {
  const w = await Workout.findByIdAndUpdate(req.params.id, req.body, { new: true });
  return w ? res.json(w) : res.status(404).json({ message: 'Workout not found' });
});
router.delete('/workouts/:id', basicAuth, async (req, res) => {
  const w = await Workout.findById(req.params.id);
  if (!w) return res.status(404).json({ message: 'Workout not found' });
  await w.deleteOne();
  return res.json({ message: 'Workout removed' });
});

// Schedule
router.get('/schedule', basicAuth, async (_req, res) => {
  let s = await Schedule.findOne({});
  if (!s) s = await Schedule.create({ days: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map(d => ({ day: d, workouts: [] })) });
  res.json(s);
});
router.put('/schedule', basicAuth, async (req, res) => {
  const { days } = req.body;
  const s = await Schedule.findOneAndUpdate({}, { days }, { new: true, upsert: true });
  res.json(s);
});

// Performance
router.get('/performance', basicAuth, async (_req, res) => res.json(await WorkoutPerformance.find({}).sort({ createdAt: -1 })));
router.post('/performance', basicAuth, async (req, res) => {
  const { workoutId, exercises, duration, notes } = req.body;
  const wk = await Workout.findById(workoutId);
  if (!wk) return res.status(404).json({ message: 'Workout not found' });
  const p = await new WorkoutPerformance({ workoutId, workoutName: wk.name, exercises, duration, notes }).save();
  res.status(201).json(p);
});

// Auth verify
router.get('/auth/verify', basicAuth, (_req, res) => res.json({ message: 'Authentication valid' }));

// --- Mount routes then handlers ---
app.use('/.netlify/functions/api', router);
app.use((req, res, next) => { res.status(404); next(new Error('Not Found - ' + req.originalUrl)); });
app.use((err, _req, res, _next) => { const code = res.statusCode === 200 ? 500 : res.statusCode; res.status(code).json({ message: err.message, stack: process.env.NODE_ENV === 'production' ? null : err.stack }); });

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
      body: JSON.stringify({ message: err.message })
    };
  }
};
