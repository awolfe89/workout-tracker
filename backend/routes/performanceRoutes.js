import express from 'express';
import {
  getPerformances,
  getPerformancesByWorkout,
  getPerformanceById,
  createPerformance,
  updatePerformance,
  deletePerformance,
  getExerciseStats,
  getTotalStats
} from '../controllers/performanceController.js';

const router = express.Router();

router.route('/')
  .get(getPerformances)
  .post(createPerformance);

router.route('/:id')
  .get(getPerformanceById)
  .put(updatePerformance)
  .delete(deletePerformance);

router.route('/workout/:workoutId')
  .get(getPerformancesByWorkout);

router.route('/stats/exercise/:exerciseName')
  .get(getExerciseStats);

router.route('/stats/totals')
  .get(getTotalStats);

export default router;