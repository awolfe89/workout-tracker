import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/db.js';
import basicAuth from './middleware/auth.js';  
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
// Import route files
import workoutRoutes from './routes/workoutRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';
import performanceRoutes from './routes/performanceRoutes.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Log for debugging
console.log('Environment variables loaded:', {
  authUsername: process.env.AUTH_USERNAME || '[MISSING]',
  authPassword: process.env.AUTH_PASSWORD ? '[PRESENT]' : '[MISSING]'
});

// Connect to MongoDB
connectDB();

const app = express();


// CORS configuration - IMPORTANT: This must be before any routes
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middlewares
app.use(express.json());

// Verification endpoint (needed for credential checking)
app.get('/api/auth/verify', basicAuth, (req, res) => {
  res.status(200).json({ message: 'Authentication successful' });
});

// Logging middleware in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/workouts', basicAuth, workoutRoutes);
app.use('/api/schedule', basicAuth, scheduleRoutes);
app.use('/api/performance', basicAuth, performanceRoutes);
app.use('/api/utils/clear-all-data', basicAuth);

//verification 
app.get('/api/auth/verify', basicAuth, (req, res) => {
  res.status(200).json({ message: 'Authentication successful' });
});
// Test route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT =  5001;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});