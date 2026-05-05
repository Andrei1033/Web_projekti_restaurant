import express from 'express';
import {
  register,
  login,
  getMe,
  getProfile,
  updateProfile,
} from '../controllers/authController.js';

import authenticateToken from '../../middelwares/auth.js';

const router = express.Router();

// public
router.post('/register', register);
router.post('/login', login);

// protected
router.get('/me', authenticateToken, getMe);
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);

export default router;
