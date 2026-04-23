/**
 * @file middleware/upload.js
 * @description Multer configuration for dish and theme image uploads.
 *
 * Usage in a route:
 *   const { uploadSingle } = require('../middleware/upload');
 *   router.post('/image', uploadSingle, uploadController.uploadImage);
 *
 * Files are saved to: backend/uploads/menu/
 * Filename format:    1712345678_original_name.jpg
 * Max size:           5 MB
 * Allowed types:      JPG, PNG, WebP
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {fileURLToPath} from 'url';

// ES modules don't have __dirname — recreate it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads', 'menu');

// Make sure uploads/menu/ folder exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, {recursive: true});
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),

  filename: (_req, file, cb) => {
    const sanitized = file.originalname
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '_');
    cb(null, `${Date.now()}_${sanitized}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG and WebP images are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {fileSize: 5 * 1024 * 1024}, // 5 MB
});

/**
 * Multer middleware for single image upload.
 * Form field name must be "image".
 */
export const uploadSingle = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({error: `Upload error: ${err.message}`});
    }
    if (err) {
      return res.status(400).json({error: err.message});
    }
    next();
  });
};
