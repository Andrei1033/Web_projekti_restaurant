/**
 * @file middleware/adminOnly.js
 * @description Middleware that blocks non-admin users.
 * Must be used AFTER the auth middleware (which sets req.user).
 *
 * Usage:
 *   const adminOnly = require('../middleware/adminOnly');
 *   router.post('/dishes', auth, adminOnly, dishController.create);
 */

/**
 * Allows only users with role='admin' to proceed.
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({error: 'Admin access required'});
  }
  next();
};

export default adminOnly;
