/**
 * @file routes/menu.js
 * @description Routes for public menu access and admin menu management.
 *
 * Public:
 *   GET /api/menu/week?week=2026-W14
 *   GET /api/menu/day?date=YYYY-MM-DD
 *
 * Admin (requires JWT + admin role):
 *   POST   /api/menu/days
 *   PUT    /api/menu/days/:id
 *   DELETE /api/menu/days/:id
 *   DELETE /api/menu/theme/:date
 *   POST   /api/menu/days/:id/dishes
 *   DELETE /api/menu/days/:id/dishes/:dishId
 */

import express from 'express';
import {
  getWeekMenu,
  getDayMenu,
  createDay,
  updateDay,
  deleteDay,
  deleteDayTheme,
  addDishToDay,
  removeDishFromDay,
} from '../controllers/menuController.js';
import auth from '../../middelwares/auth.js';
import adminOnly from '../../middelwares/adminOnly.js';
import {uploadSingle} from '../../middelwares/upload.js';

const router = express.Router();

// Public
router.get('/week', getWeekMenu);
router.get('/day', getDayMenu);

// Admin
router.post('/days', auth, adminOnly, uploadSingle, createDay);
router.put('/days/:id', auth, adminOnly, uploadSingle, updateDay);
router.delete('/days/:id', auth, adminOnly, deleteDay);
router.delete('/theme/:date', auth, adminOnly, deleteDayTheme);
router.post('/days/:id/dishes', auth, adminOnly, addDishToDay);
router.delete('/days/:id/dishes/:dishId', auth, adminOnly, removeDishFromDay);

export default router;
