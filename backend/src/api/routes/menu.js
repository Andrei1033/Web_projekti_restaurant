import express from 'express';

import authenticateToken from '../../middelwares/auth.js';
import {uploadSingle} from '../../middelwares/upload.js';
import adminOnly from '../../middelwares/adminOnly.js';
import {
  addDishToDay,
  createDay,
  deleteDay,
  getDayMenu,
  getWeekMenu,
  removeDishFromDay,
  updateDay,
} from '../controllers/menuController.js';

const router = express.Router();

// 🌍 PUBLIC
router.get('/week', getWeekMenu);
router.get('/day', getDayMenu);

// 🔐 ADMIN
router.use(authenticateToken, adminOnly);

router.post('/days', updateDay, createDay);
router.put('/days/:id', uploadSingle, updateDay);
router.delete('/days/:id', deleteDay);
//router.delete('/theme/:date', deleteDayTheme);
router.post('/days/:id/dishes', addDishToDay);
router.delete('/days/:id/dishes/:dishId', removeDishFromDay);

export default router;
