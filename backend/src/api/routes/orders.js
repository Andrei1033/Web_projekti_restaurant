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
  updateOrder,
  getDashboard,
} from '../controllers/orderController.js';

import auth from '../../middelwares/auth.js';
import adminOnly from '../../middelwares/adminOnly.js';

const router = express.Router();

// Public
/**
 * @api {get} /api/availability Tarkista pöytien saatavuus
 * @apiName GetAvailability
 * @apiGroup Varaukset
 *
 * @apiQuery {String} date Päivämäärä (YYYY-MM-DD)
 * @apiQuery {Number} guests Henkilömäärä
 * @apiQuery {String} time Aika (HH:MM)
 *
 * @apiSuccess {Boolean} available Onko pöytiä vapaana
 * @apiSuccess {Number} availableTables Vapaiden pöytien määrä
 *
 * @apiError {String} error Virheilmoitus
 */
router.get('/availability', checkAvailability);
/**
 * @api {post} /api/orders Luo uusi tilaus
 * @apiName CreateOrder
 * @apiGroup Varaukset
 *
 * @apiBody {String} date Päivämäärä (YYYY-MM-DD)
 * @apiBody {String} time Aika (HH:MM)
 * @apiBody {Number} guests Henkilömäärä
 * @apiBody {String} notes Erityistoiveet (valinnainen)
 * @apiBody {Array} items Tilatut ruokalajit (valinnainen)
 *
 * @apiSuccess {Object} order Luotu tilaus
 *
 * @apiError {String} error Virheilmoitus tilauksen luomisessa
 */
router.post('/', createOrder);

/**
 * @api {get} /api/orders/my Hae omat tilaukset
 * @apiName GetMyOrders
 * @apiGroup Varaukset
 *
 * @apiHeader {String} Authorization JWT-token
 *
 * @apiSuccess {Array} orders Käyttäjän tilaukset
 *
 * @apiError {String} error Virheilmoitus tilauksia haettaessa
 */
router.get('/my', auth, getMyOrders);
/**
 * @api {get} /api/orders/:id Hae tilaus ID:llä
 * @apiName GetOrderById
 * @apiGroup Varaukset
 *
 * @apiHeader {String} Authorization JWT-token
 * @apiParam {Number} id Tilaus ID
 *
 * @apiSuccess {Object} order Tilausobjekti
 *
 * @apiError {String} error Virheilmoitus tilauksen haussa
 */
router.get('/:id', auth, getOrderById);

/**
 * @api {get} /api/admin/orders Hae kaikki tilaukset (admin)
 * @apiName GetAllOrders
 * @apiGroup Varaukset
 *
 * @apiHeader {String} Authorization JWT-token
 *
 * @apiSuccess {Array} orders Kaikki tilaukset
 *
 * @apiError {String} error Virheilmoitus tilauksia haettaessa
 */
router.get('/admin/all', auth, adminOnly, getAllOrders);
/**
 * @api {get} /api/admin/dashboard Hae tilastotietoja dashboardille (admin)
 * @apiName GetDashboard
 * @apiGroup Varaukset
 *
 * @apiHeader {String} Authorization JWT-token
 *
 * @apiSuccess {Object} stats Tilastotiedot (esim. päivittäiset tilaukset, suosituimmat ruuat)
 *
 * @apiError {String} error Virheilmoitus tietoja haettaessa
 */
router.get('/admin/dashboard', auth, adminOnly, getDashboard);
/** * @api {patch} /api/orders/:id/status Päivitä tilauksen status (admin)
 * @apiName UpdateStatus
 * @apiGroup Varaukset
 *
 * @apiHeader {String} Authorization JWT-token
 * @apiParam {Number} id Tilaus ID
 * @apiBody {String} status Uusi status (esim. "pending", "confirmed", "cancelled")
 *
 * @apiSuccess {Object} order Päivitetty tilausobjekti
 *
 * @apiError {String} error Virheilmoitus tilauksen päivittämisessä
 */
router.patch('/:id/status', auth, adminOnly, updateStatus);
/** * @api {put} /api/orders/:id Päivitä tilaus (admin)
 * @apiName UpdateOrder
 * @apiGroup Varaukset
 *
 * @apiHeader {String} Authorization JWT-token
 * @apiParam {Number} id Tilaus ID
 * @apiBody {String} date Päivämäärä (YYYY-MM-DD)
 * @apiBody {String} time Aika (HH:MM)
 * @apiBody {Number} guests Henkilömäärä
 * @apiBody {String} notes Erityistoiveet (valinnainen)
 * @apiBody {Array} items Tilatut ruokalajit (valinnainen)
 *
 * @apiSuccess {Object} order Päivitetty tilausobjekti
 *
 * @apiError {String} error Virheilmoitus tilauksen päivittämisessä
 */
router.put('/:id', auth, adminOnly, updateOrder);
/** * @api {delete} /api/orders/:id Peru tilaus (admin)
 * @apiName CancelOrder
 * @apiGroup Varaukset
 *
 * @apiHeader {String} Authorization JWT-token
 * @apiParam {Number} id Tilaus ID
 *
 * @apiSuccess {String} message Vahvistus tilauksen peruutuksesta
 *
 * @apiError {String} error Virheilmoitus tilauksen peruessa
 */
router.delete('/:id', auth, adminOnly, cancelOrder);

export default router;
