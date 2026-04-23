import express from 'express';
import {
  getAllDishes,
  getDishById,
  createDish,
  updateDish,
  deleteDish,
} from '../controllers/menuController.js';
import auth from '../../middelwares/auth.js';
import adminOnly from '../../middelwares/adminOnly.js';
import {uploadSingle} from '../../middelwares/upload.js';

const router = express.Router();

// Public
router.get('/', getAllDishes);
router.get('/:id', getDishById);

// Admin
router.post('/', auth, adminOnly, uploadSingle, createDish);
router.put('/:id', auth, adminOnly, uploadSingle, updateDish);
router.delete('/:id', auth, adminOnly, deleteDish);

export default router;
