/**
 * @file routes/orders.js
 *
 * Public:
 *   GET  /api/availability            → checkAvailability
 *   POST /api/orders                  → createOrder
 *
 * Logged-in user:
 *   GET  /api/orders/my               → getMyOrders
 *   GET  /api/orders/:id              → getOrderById
 *
 * Admin:
 *   GET    /api/admin/orders          → getAllOrders
 *   GET    /api/admin/dashboard       → getDashboard
 *   PATCH  /api/orders/:id/status     → updateStatus
 *   DELETE /api/orders/:id            → cancelOrder
 */

import express from 'express';
import {
  checkAvailability,
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateStatus,
  cancelOrder,
  getDashboard,
} from '../controllers/orderController.js';

import auth from '../../middelwares/auth.js';
import adminOnly from '../../middelwares/adminOnly.js';

const router = express.Router();

// Public
router.get('/availability', checkAvailability);
router.post('/', createOrder);

// Logged-in user
router.get('/my', auth, getMyOrders);
router.get('/:id', auth, getOrderById);

// Admin
router.get('/admin/all', auth, adminOnly, getAllOrders);
router.get('/admin/dashboard', auth, adminOnly, getDashboard);
router.patch('/:id/status', auth, adminOnly, updateStatus);
router.delete('/:id', auth, adminOnly, cancelOrder);

export default router;
