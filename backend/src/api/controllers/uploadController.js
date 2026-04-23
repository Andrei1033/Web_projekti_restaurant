/**
 * @file controllers/uploadController.js
 * @description Handles standalone image uploads.
 * Used when the admin uploads an image BEFORE creating a dish or day theme,
 * so the frontend can preview the image and get the URL to include in the form.
 *
 * Endpoint: POST /api/uploads/image  (Admin, multipart/form-data, field: "image")
 * Response: { url: "/uploads/menu/filename.jpg" }
 */

/**
 * Receives an uploaded image (via Multer) and returns its public URL.
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */

const uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({error: 'No image file received'});
  }

  const url = `/uploads/menu/${req.file.filename}`;
  res.status(201).json({url});
};

module.exports = {uploadImage};
