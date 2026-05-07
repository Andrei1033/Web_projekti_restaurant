/**
 * @file routes/uploads.js
 * @description Standalone image upload endpoint.
 * Admin can upload an image first, get back a URL,
 * then use that URL when creating a dish or day theme.
 *
 * POST /api/uploads/image   multipart/form-data, field: "image"
 */

import express from 'express';
import {uploadImage, getGalleryImages} from '../controllers/menuController.js';
import auth from '../../middelwares/auth.js';
import adminOnly from '../../middelwares/adminOnly.js';
import {uploadSingle} from '../../middelwares/upload.js';

const router = express.Router();

/**
 * @api {post} /api/uploads/image Lataa uusi kuva
 * @apiName UploadImage
 * @apiGroup Kuvat
 *
 * @apiHeader {String} Authorization JWT-token
 * @apiBody {File} image Kuva (multipart/form-data)
 *
 * @apiSuccess {String} url Ladattu kuvan URL
 *
 * @apiError {String} error Virheilmoitus kuvan lataamisessa
 */
router.post('/image', auth, adminOnly, uploadSingle, uploadImage);
/**
 * @api {get} /api/uploads/gallery Hae galleriakuvat
 * @apiName GetGalleryImages
 * @apiGroup Kuvat
 *
 * @apiHeader {String} Authorization JWT-token
 *
 * @apiSuccess {Array} images Lista galleriakuvien URL-osoitteista
 *
 * @apiError {String} error Virheilmoitus kuvien hakemisessa
 */
router.get('/gallery', auth, adminOnly, getGalleryImages);

export default router;
