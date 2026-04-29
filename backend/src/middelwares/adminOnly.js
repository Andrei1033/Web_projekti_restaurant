const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.sendStatus(401);
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({error: 'Admin access required'});
  }

  next();
};

export default adminOnly;
