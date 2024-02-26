const bcrypt = require('bcrypt');
const { User: UserModel } = require('../model/User');

module.exports = {
  getUsers: async (_, resp) => {
    try {
      const users = await UserModel.find();
      resp.json(users);
    } catch (error) {
      resp.status(500).json({ message: 'Aconteceu um erro no servidor, tente novamente mais tarde!' });
    }
  },
  getUserById: async (req, resp) => {
    try {
      const { uid } = req.params;
      const user = await UserModel.findById(uid);

      if (!user) resp.status(404).json({ message: 'Usuário não encontrado.' });
      resp.json(user);
    } catch (error) {
      resp.status(500).json({ message: 'Aconteceu um erro no servidor, tente novamente mais tarde!' });
    }
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
  updateUser: async (req, resp) => {
    try {
      const { uid } = req.params;
      const { email, password, role } = req.body;

      const roles = ['admin', 'chef', 'waiter'];
      if (role && !roles.includes(role)) resp.status(422).json({ message: 'A função não é válida.' });

      const user = await UserModel.findByIdAndUpdate(uid, { email, role, password });
      if (!user) resp.status(404).json({ message: 'Usuário não encontrado.' });

      resp.status(200).json({ message: 'Usuário atualizado com sucesso', user });
    } catch (error) {
      resp.status(500).json({ message: 'Aconteceu um erro no servidor, tente novamente mais tarde!' });
    }
  },
  deleteUser: async (req, resp) => {
    try {
      const { uid } = req.params;
      const user = await UserModel.findById(uid);

      if (!user) resp.status(404).json({ message: 'Usuário não encontrado.' });

      const deletedUser = await UserModel.findByIdAndDelete(uid);
      resp.status(200).json({ message: 'Usuário deletado com sucesso', user: deletedUser });
    } catch (error) {
      resp.status(500).json({ message: 'Aconteceu um erro no servidor, tente novamente mais tarde!' });
    }
  },
};
