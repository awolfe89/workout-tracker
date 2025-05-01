// routes/dateWorkoutRoutes.js
const express = require('express');
const { 
  getWorkoutsByDate, 
  getWorkoutsByDateRange, 
  updateWorkoutsByDate 
} = require('../controllers/dateWorkoutController');
const basicAuth = require('../middleware/auth');

const router = express.Router();

router.get('/range', basicAuth, getWorkoutsByDateRange);
router.get('/:date', basicAuth, getWorkoutsByDate);
router.put('/:date', basicAuth, updateWorkoutsByDate);

module.exports = router;