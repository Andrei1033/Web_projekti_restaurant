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

/**
 * @api {get} /api/dishes Hae kaikki ruuat
 * @apiName GetDishes
 * @apiGroup Ruuat
 *
 * @apiSuccess {Array} dishes Lista ruuista
 */
router.get('/', getAllDishes);
/**
 * @api {get} /api/dishes/:id Hae ruoka ID:llä
 * @apiName GetDishById
 * @apiGroup Ruuat
 *
 * @apiParam {Number} id Ruoka ID
 *
 * @apiSuccess {Object} dish Ruokaobjekti
 *
 * @apiSuccessExample {json} Onnistunut vastaus:
 *     HTTP/1.1 200 OK
 *     {
 *       "id": 1,
 *       "name": "Pasta Carbonara",
 *       "description": "Kermainen pastaruoka pekonilla",
 *       "price": 12.90,
 *       "dietTags": ["gluteeniton"],
 *       "imageUrl": "http://example.com/images/carbonara.jpg"
 *     }
 */
router.get('/:id', getDishById);

/**
 * @api {post} /api/dishes Luo uusi ruoka
 * @apiName CreateDish
 * @apiGroup Ruuat
 *
 * @apiHeader {String} Authorization
 * @apiBody {String} name Ruuan nimi
 * @apiBody {String} description Ruuan kuvaus
 * @apiBody {Number} price Ruuan hinta
 * @apiBody {Array} dietTags Ruokavalio-tunnisteet (esim. ["vegaani", "gluteeniton"])
 * @apiBody {File} image Ruuan kuva (multipart/form-data, field: "image")
 *
 * @apiSuccess {Object} dish Luotu ruokaobjekti
 *
 * @apiSuccessExample {json} Onnistunut vastaus:
 *     HTTP/1.1 201 Created
 *     {
 *       "id": 2,
 *       "name": "Vegan Burger",
 *       "description": "Maukas vegaaninen hampurilainen",
 *       "price": 10.50,
 *       "dietTags": ["vegaani"],
 *       "imageUrl": "http://example.com/images/vegan-burger.jpg"
 *     }
 *
 * @apiError {String} error Virheilmoitus
 */
router.post('/', auth, adminOnly, uploadSingle, createDish);
/**
 * @api {put} /api/dishes/:id Päivitä ruoka
 * @apiName UpdateDish
 * @apiGroup Ruuat
 *
 * @apiHeader {String} Authorization
 * @apiParam {Number} id Ruoka ID
 * @apiBody {String} [name] Ruuan nimi
 * @apiBody {String} [description] Ruuan kuvaus
 * @apiBody {Number} [price] Ruuan hinta
 * @apiBody {Array} [dietTags] Ruokavalio-tunnisteet (esim. ["vegaani", "gluteeniton"])
 * @apiBody {File} [image] Ruuan kuva (multipart/form-data, field: "image")
 *
 * @apiSuccess {Object} dish Päivitetty ruokaobjekti
 *
 * @apiSuccessExample {json} Onnistunut vastaus:
 *     HTTP/1.1 200 OK
 *     {
 *       "id": 2,
 *       "name": "Vegan Burger",
 *       "description": "Maukas vegaaninen hampurilainen",
 *       "price": 10.50,
 *       "dietTags": ["vegaani"],
 *       "imageUrl": "http://example.com/images/vegan-burger.jpg"
 *     }
 *
 * @apiError {String} error Virheilmoitus
 */
router.put('/:id', auth, adminOnly, uploadSingle, updateDish);
/** * @api {delete} /api/dishes/:id Poista ruoka
 * @apiName DeleteDish
 * @apiGroup Ruuat
 *
 * @apiHeader {String} Authorization
 * @apiParam {Number} id Ruoka ID
 *
 * @apiSuccess {String} message Vahvistusviesti
 *
 * @apiSuccessExample {json} Onnistunut vastaus:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "Dish deleted successfully"
 *     }
 *
 * @apiError {String} error Virheilmoitus
 */
router.delete('/:id', auth, adminOnly, deleteDish);

export default router;
