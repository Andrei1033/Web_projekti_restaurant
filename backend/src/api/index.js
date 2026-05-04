import express from 'express';
import authRoutes from './routes/authRouter.js';
import menuRoutes from './routes/menu.js';
import dishRoutes from './routes/dishes.js';
import uploadRoutes from './routes/uploads.js';
import orderRoutes from './routes/orders.js';

import adminRoutes from './routes/admin.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/menu', menuRoutes);
router.use('/dishes', dishRoutes);
router.use('/uploads', uploadRoutes);
router.use('/orders', orderRoutes);

router.use('/admin', adminRoutes);

// /api/availability → orderRoutes handles it internally
router.get('/availability', async (req, res) => {
  // Forward to orderController directly
  const {checkAvailability} = await import('./controllers/orderController.js');
  return checkAvailability(req, res);
});

// Health check — testaa että API vastaa
router.get('/health', (_req, res) => {
  res.json({status: 'ok', timestamp: new Date().toISOString()});
});

export default router;
