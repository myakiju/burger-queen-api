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

    next();

    // TODO: Verify user identity using `decodeToken.uid`
  });
};

module.exports.isAuthenticated = (req) => (
  // TODO: Decide based on the request information whether the user is authenticated
  true
);

module.exports.isAdmin = (req) => (
  // TODO: Decide based on the request information whether the user is an admin
  true
);

module.exports.requireAuth = (req, resp, next) => (
  (!module.exports.isAuthenticated(req))
    ? next(401)
    : next()
);

module.exports.requireAdmin = (req, resp, next) => (
  // eslint-disable-next-line no-nested-ternary
  (!module.exports.isAuthenticated(req))
    ? next(401)
    : (!module.exports.isAdmin(req))
      ? next(403)
      : next()
);
