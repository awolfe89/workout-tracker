// routes/workoutRoutes.js
import express from 'express';
import {
  getWorkouts,
  getWorkoutById,
  createWorkout,
  updateWorkout,
  deleteWorkout
  // Import other controller functions you need
} from '../controllers/workoutController.js';

const router = express.Router();

router.route('/')
  .get(getWorkouts)
  .post(createWorkout);

router.route('/:id')
  .get(getWorkoutById)
  .put(updateWorkout)
  .delete(deleteWorkout);

// Add a route to delete all workouts if needed
router.route('/all')
  .delete(async (req, res) => {
    try {
      // Delete all workouts logic here
      res.status(200).json({ message: 'All workouts deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

export default router;