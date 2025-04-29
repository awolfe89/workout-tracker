// netlify/functions/api.js
const express = require('express');
const serverless = require('serverless-http');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

// Import your route files 
const workoutRoutes = require('../../routes/workoutRoutes');
const scheduleRoutes = require('../../routes/scheduleRoutes');
const performanceRoutes = require('../../routes/performanceRoutes');

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
    // Don't exit process in serverless context
    return false;
  }
  return true;
};

// Middleware
app.use(cors({
  origin: '*', // In production, you'd want to restrict this
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

// Auth verification endpoint
router.get('/auth/verify', basicAuth, (req, res) => {
  res.status(200).json({ message: 'Authentication successful' });
});

// Mount your routes
router.use('/workouts', basicAuth, workoutRoutes);
router.use('/schedule', basicAuth, scheduleRoutes);
router.use('/performance', basicAuth, performanceRoutes);

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