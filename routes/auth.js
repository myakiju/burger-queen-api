const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../config');
const { User: UserModel } = require('../model/User');

const { secret } = config;

/** @module auth */
module.exports = (app, nextMain) => {
  /**
   * @name /login
   * @description Creates an authentication token.
   * @path {POST} /login
   * @body {String} email Email
   * @body {String} password Password
   * @response {Object} resp
   * @response {Object} resp
   * @response {String} resp.accessToken Token to be used for subsequent requests
   * @response {Object} resp.user User information
   * @code {200} if authentication is successful
   * @code {400} if `email` or `password` are not provided, or both
   * @code {400} if `email` or `password` are invalid
   * @auth No authentication required
   */
  app.post('/login', async (req, resp, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return resp.status(400).json({ error: 'É necessário informar email e senha.' });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return resp.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
      return resp.status(404).json({ error: 'Senha inválida.' });
    }

    try {
      const token = jwt.sign(
        {
          uid: user._id,
          role: user.role,
        },
        secret,
      );

      resp.status(200).json({ message: 'Autenticação realizada com sucesso.', accessToken: token, user: { id: user._id, email: user.email, role: user.role } });
    } catch (error) {
      next(error);
    }

    next();
  });

  return nextMain();
};
