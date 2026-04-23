import express from 'express';
import authRoutes from './routes/authRouter.js';
import menuRoutes from './routes/menu.js';
import dishRoutes from './routes/dishes.js';
import uploadRoutes from './routes/uploads.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/menu', menuRoutes);
router.use('/dishes', dishRoutes);
router.use('/uploads', uploadRoutes);

// Health check — testaa että API vastaa
router.get('/health', (_req, res) => {
  res.json({status: 'ok', timestamp: new Date().toISOString()});
});

export default router;
