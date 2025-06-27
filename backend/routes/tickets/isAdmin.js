// middlewares/isAdmin.js

module.exports = function (req, res, next) {
  if (req.session?.user?.is_admin) {
    return next(); // ✅ Accès autorisé
  }

  return res.status(403).json({ error: 'Accès interdit : réservé aux administrateurs.' });
};
