// middlewares/isAdmin.js

module.exports = function (req, res, next) {
  if (req.session?.user?.is_admin) {
    return next(); // ✅ Authorized access
  }

  return res.status(403).json({ error: 'Access denied: admins only.' });
};
