// routes/scheduleRoutes.js
import express from 'express';
import {
  getSchedule,
  updateSchedule,
  updateScheduleDay  // Changed from updateDaySchedule to updateScheduleDay
} from '../controllers/scheduleController.js';

const router = express.Router();

router.route('/')
  .get(getSchedule)
  .put(updateSchedule);

router.route('/:day')
  .put(updateScheduleDay);  // Changed from updateDaySchedule to updateScheduleDay

// Add a route to delete all schedule data if needed
router.route('/all')
  .delete(async (req, res) => {
    try {
      // Delete all schedule data logic here
      const result = await Schedule.deleteMany({});
      res.status(200).json({ message: 'All schedule data deleted successfully', deleted: result.deletedCount });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

export default router;