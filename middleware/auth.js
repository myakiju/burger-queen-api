const jwt = require('jsonwebtoken');
const { User: UserModel } = require('../model/User');

module.exports = (secret) => (req, resp, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return next();
  }

  const [type, token] = authorization.split(' ');

  if (type.toLowerCase() !== 'bearer') {
    return next();
  }

  jwt.verify(token, secret, async (err, decodedToken) => {
    if (err) {
      return next(403);
    }

    const user = await UserModel.findOne({ _id: decodedToken.uid });

    if (!user) resp.status(404).json({ message: 'Usuário não encontrado.' });

    req.userId = decodedToken.uid;
    req.userRole = decodedToken.role;

    next();
  });
};

module.exports.isAuthenticated = (req) => !!req.userId;

module.exports.isAdmin = (req) => req.userRole === 'admin';

module.exports.requireAuth = (req, _, next) => (
  (!module.exports.isAuthenticated(req))
    ? next(401)
    : next()
);

module.exports.requireAdmin = (req, _, next) => (
  // eslint-disable-next-line no-nested-ternary
  (!module.exports.isAuthenticated(req))
    ? next(401)
    : (!module.exports.isAdmin(req))
      ? next(403)
      : next()
);
