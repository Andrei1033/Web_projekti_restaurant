// auth //
const auth = (req, res, next) => {
  // DEVELOPMENT ONLY — hyväksyy kaikki pyynnöt ilman tokenia
  // Lisää fake user jotta adminOnly-middleware ei kaadu
  req.user = {
    id: 1,
    email: 'dev@nightwolf.fi',
    role: 'admin',
  };
  next();
};

export default auth;
