import express from 'express';
import authenticateToken from '../../middelwares/auth.js';
import adminOnly from '../../middelwares/adminOnly.js';

const router = express.Router();

// DASHBOARD
router.get('/dashboard', authenticateToken, adminOnly, (req, res) => {
  res.json({message: 'Admin dashboard OK'});
});

// USERS
router.get('/users', authenticateToken, adminOnly, (req, res) => {
  res.json({message: 'List users here'});
});

export default router;
