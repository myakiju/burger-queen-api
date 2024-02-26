const bcrypt = require('bcrypt');
const { User: UserModel } = require('../model/User');

module.exports = {
  getUsers: (req, resp, next) => {
    // TODO: Implement the necessary function to fetch the `users` collection or table
  },
  createUser: async (req, resp) => {
    try {
      const roles = ['admin', 'chef', 'waiter'];
      const { email, password, role } = req.body;

      if (!email) resp.status(422).json({ message: 'O email é obrigatório.' });
      if (!password) resp.status(422).json({ message: 'A senha é obrigatória.' });
      if (!role) resp.status(422).json({ message: 'A função é obrigatória.' });
      if (!roles.includes(role)) resp.status(422).json({ message: 'A função não é válida.' });

      const userExists = await UserModel.findOne({ email });

      if (userExists) resp.status(422).json({ message: 'Usuário já cadastrado.' });

      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);

      const response = await UserModel.create({ email, password: passwordHash, role });

      resp.status(201).json({ response, message: 'Usuário criado com sucesso' });
    } catch (error) {
      resp.status(500).json({ message: 'Aconteceu um erro no servidor, tente novamente mais tarde!' });
    }
  },
};
