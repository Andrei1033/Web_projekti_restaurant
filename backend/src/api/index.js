// api/index.js
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

/**
 * @api {get} /api/about Hae tietoa ravintolasta
 * @apiName GetAbout
 * @apiGroup Yleinen
 *
 * @apiSuccess {String} name Ravintolan nimi
 * @apiSuccess {String} description Kuvaus
 * @apiSuccess {String} address Osoite
 * @apiSuccess {String} phone Puhelinnumero
 * @apiSuccess {String} email Sähköposti
 *
 * @apiError {String} error Virheilmoitus jos dataa ei löydy
 */
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
router.get('/availability', async (req, res) => {
  // Forward to orderController directly
  const {checkAvailability} = await import('./controllers/orderController.js');
  return checkAvailability(req, res);
});

/**
 * @api {get} /api/health Terveystarkistus API:lle
 * @apiName GetHealth
 * @apiGroup Yleinen
 *
 * @apiSuccess {String} status API:n tila ("ok")
 * @apiSuccess {String} timestamp Aikaleima (ISO 8601)
 *
 * @apiSuccessExample {json} Onnistunut vastaus:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "ok",
 *       "timestamp": "2024-01-15T12:00:00.000Z"
 *     }
 */
router.get('/health', (_req, res) => {
  res.json({status: 'ok', timestamp: new Date().toISOString()});
});

export default router;
