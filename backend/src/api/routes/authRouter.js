// authRouter.js
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

/**
 * @api {post} /api/auth/register Rekisteröidy
 * @apiName PostRegister
 * @apiGroup Auth
 *
 * @apiBody {String} email Sähköposti
 * @apiBody {String} password Salasana
 * @apiBody {String} name Nimi
 *
 * @apiSuccess {Object} user Rekisteröitynyt käyttäjä
 * @apiSuccess {String} token JWT-token
 *
 * @apiSuccessExample {json} Onnistunut vastaus:
 *     HTTP/1.1 201 Created
 *     {
 *       "user": { "id": 1, "email": "user@example.com", "name": "John Doe" },
 *       "token": "jwt.token.here"
 *     }
 */
router.post('/register', register);
/** * @api {post} /api/auth/login Kirjaudu sisään
 * @apiName PostLogin
 * @apiGroup Auth
 *
 * @apiBody {String} email Sähköposti
 * @apiBody {String} password Salasana
 *
 * @apiSuccess {Object} user Kirjautunut käyttäjä
 * @apiSuccess {String} token JWT-token
 *
 * @apiSuccessExample {json} Onnistunut vastaus:
 *     HTTP/1.1 200 OK
 *     {
 *       "user": { "id": 1, "email": "
 */
router.post('/login', login);

/**
 * @api {get} /api/auth/me Hae käyttäjän tiedot
 * @apiName GetMe
 * @apiGroup Auth
 *
 * @apiSuccess {Object} user Käyttäjän tiedot
 *
 * @apiSuccessExample {json} Onnistunut vastaus:
 *     HTTP/1.1 200 OK
 *     {
 *       "user": { "id": 1, "email": "user@example.com", "name": "John Doe" }
 *     }
 */
router.get('/me', authenticateToken, getMe);
/**
 * @api {get} /api/auth/profile Hae käyttäjän profiili
 * @apiName GetProfile
 * @apiGroup Auth
 *
 * @apiSuccess {Object} user Käyttäjän profiilin tiedot
 *
 * @apiSuccessExample {json} Onnistunut vastaus:
 *     HTTP/1.1 200 OK
 *     {
 *       "user": { "id": 1, "email": "user@example.com", "name": "John Doe" }
 *     }
 */
router.get('/profile', authenticateToken, getProfile);
/**
 * @api {put} /api/auth/profile Päivitä käyttäjän profiili
 * @apiName UpdateProfile
 * @apiGroup Auth
 *
 * @apiBody {String} name Nimi
 * @apiBody {String} email Sähköposti
 *
 * @apiSuccess {Object} user Päivitetty käyttäjän profiili
 *
 * @apiSuccessExample {json} Onnistunut vastaus:
 *     HTTP/1.1 200 OK
 *     {
 *       "user": { "id": 1, "email": "user@example.com", "name": "John Doe" }
 *     }
 */
router.put('/profile', authenticateToken, updateProfile);

export default router;
