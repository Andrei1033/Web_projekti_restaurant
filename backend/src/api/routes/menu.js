import express from 'express';

import authenticateToken from '../../middelwares/auth.js';
import {uploadSingle} from '../../middelwares/upload.js';
import adminOnly from '../../middelwares/adminOnly.js';
import {
  addDishToDay,
  createDay,
  deleteDay,
  deleteDayTheme,
  getDayMenu,
  getWeekMenu,
  removeDishFromDay,
  updateDay,
} from '../controllers/menuController.js';

const router = express.Router();

// ==================== PUBLIC REITIT (ei vaadi kirjautumista) ====================

/**
 * @api {get} /api/menu/week Hae viikon ruokalistat
 * @apiName GetWeekMenu
 * @apiGroup Menu
 *
 * @apiSuccess {Object[]} week Viikon ruokalistat
 * @apiSuccess {String} week.date Päivämäärä
 * @apiSuccess {String} week.theme Teema
 * @apiSuccess {Object[]} week.dishes Ruokalistan annokset
 */
router.get('/week', getWeekMenu);

/**
 * @api {get} /api/menu/day Hae päivän ruokalista
 * @apiName GetDayMenu
 * @apiGroup Menu
 *
 * @apiParam {String} date Päivämäärä muodossa YYYY-MM-DD (query-parametri)
 *
 * @apiSuccess {String} date Päivämäärä
 * @apiSuccess {String} theme Teema
 * @apiSuccess {Object[]} dishes Lista annoksista
 * @apiSuccess {Number} dishes.id Annoksen ID
 * @apiSuccess {String} dishes.name Annoksen nimi
 * @apiSuccess {String} dishes.description Kuvaus
 * @apiSuccess {Number} dishes.price Hinta
 * @apiSuccess {String[]} dishes.dietTags Dieettitagit
 * @apiSuccess {String} dishes.imageUrl Kuvan URL
 *
 * @apiSuccessExample {json} Onnistunut vastaus:
 *     HTTP/1.1 200 OK
 *     {
 *       "date": "2024-06-01",
 *       "theme": "Kesämenu",
 *       "dishes": [
 *         {
 *           "id": 1,
 *           "name": "Pasta Carbonara",
 *           "description": "Kermainen pastaruoka pekonilla",
 *           "price": 12.90,
 *           "dietTags": ["gluteeniton"],
 *           "imageUrl": "http://example.com/images/carbonara.jpg"
 *         }
 *       ]
 *     }
 */
router.get('/day', getDayMenu);

// ==================== ADMIN REITIT (vaativat kirjautumisen ja admin-oikeudet) ====================
// Tästä eteenpäin KAIKKI reitit vaativat tokenin ja admin-oikeudet
router.use(authenticateToken, adminOnly);

/**
 * @api {post} /api/menu/days Luo uusi päivän ruokalista
 * @apiName CreateDay
 * @apiGroup Menu (Admin)
 *
 * @apiHeader {String} Authorization JWT-token (admin)
 * @apiBody {String} date Päivämäärä muodossa YYYY-MM-DD
 * @apiBody {String} theme Teema (esim. "Kesämenu")
 * @apiBody {File} image Teeman kuva (multipart/form-data, field: "image")
 *
 * @apiSuccess {String} date Päivämäärä
 * @apiSuccess {String} theme Teema
 * @apiSuccess {Object[]} dishes Tyhjä lista aluksi
 *
 * @apiSuccessExample {json} Onnistunut vastaus:
 *     HTTP/1.1 201 Created
 *     {
 *       "date": "2024-06-01",
 *       "theme": "Kesämenu",
 *       "dishes": []
 *     }
 */
router.post('/days', uploadSingle, createDay);

/**
 * @api {put} /api/menu/days/:id Päivitä päivän ruokalista
 * @apiName UpdateDay
 * @apiGroup Menu (Admin)
 *
 * @apiHeader {String} Authorization JWT-token (admin)
 * @apiParam {Number} id Päivän ruokalistan ID
 * @apiBody {String} [date] Päivämäärä muodossa YYYY-MM-DD
 * @apiBody {String} [theme] Teema
 * @apiBody {File} [image] Teeman kuva (multipart/form-data)
 *
 * @apiSuccess {String} date Päivitetty päivämäärä
 * @apiSuccess {String} theme Päivitetty teema
 * @apiSuccess {Object[]} dishes Annokset
 */
router.put('/days/:id', uploadSingle, updateDay);

/**
 * @api {delete} /api/menu/days/:id Poista päivän ruokalista
 * @apiName DeleteDay
 * @apiGroup Menu (Admin)
 *
 * @apiHeader {String} Authorization JWT-token (admin)
 * @apiParam {Number} id Päivän ruokalistan ID
 *
 * @apiSuccess {Boolean} success Onnistumisen tila
 */
router.delete('/days/:id', deleteDay);

/**
 * @api {delete} /api/menu/theme/:date Poista päivän teema
 * @apiName DeleteDayTheme
 * @apiGroup Menu (Admin)
 *
 * @apiHeader {String} Authorization JWT-token (admin)
 * @apiParam {String} date Päivämäärä muodossa YYYY-MM-DD
 *
 * @apiSuccess {Boolean} success Onnistumisen tila
 */
router.delete('/theme/:date', deleteDayTheme);

/**
 * @api {post} /api/menu/days/:id/dishes Lisää ruoka päivän ruokalistaan
 * @apiName AddDishToDay
 * @apiGroup Menu (Admin)
 *
 * @apiHeader {String} Authorization JWT-token (admin)
 * @apiParam {Number} id Päivän ruokalistan ID
 * @apiBody {Number} dishId Lisättävän ruoan ID
 *
 * @apiSuccess {Object} menu Päivitetty päivän ruokalista
 */
router.post('/days/:id/dishes', addDishToDay);

/**
 * @api {delete} /api/menu/days/:id/dishes/:dishId Poista ruoka päivän ruokalistasta
 * @apiName RemoveDishFromDay
 * @apiGroup Menu (Admin)
 *
 * @apiHeader {String} Authorization JWT-token (admin)
 * @apiParam {Number} id Päivän ruokalistan ID
 * @apiParam {Number} dishId Poistettavan ruoan ID
 *
 * @apiSuccess {Object} menu Päivitetty päivän ruokalista
 */
router.delete('/days/:id/dishes/:dishId', removeDishFromDay);

export default router;
