import express from 'express';
import authRoutes from './routes/authRouter.js';
import menuRoutes from './routes/menu.js';
import dishRoutes from './routes/dishes.js';
import uploadRoutes from './routes/uploads.js';
import orderRoutes from './routes/orders.js';

import adminRoutes from './routes/admin.js';
import {readFile} from 'fs/promises';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/menu', menuRoutes);
router.use('/dishes', dishRoutes);
router.use('/uploads', uploadRoutes);
router.use('/orders', orderRoutes);

router.use('/admin', adminRoutes);

// Public ABOUT endpoint (reads the same JSON used by admin)
router.get('/about', async (_req, res) => {
  try {
    const data = await readFile(
      new URL('../data/about.json', import.meta.url),
      'utf8'
    );
    return res.json(JSON.parse(data));
  } catch (err) {
    console.error('Error reading about data:', err);
    return res.status(500).json({error: 'Could not read about data'});
  }
});
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
