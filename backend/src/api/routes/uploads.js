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

router.post('/image', auth, adminOnly, uploadSingle, uploadImage);
router.get('/gallery', auth, adminOnly, getGalleryImages);

export default router;
