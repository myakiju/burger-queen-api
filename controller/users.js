const bcrypt = require('bcrypt');
const { User: UserModel } = require('../model/User');

module.exports = {
  getUsers: async (_, resp, next) => {
    try {
      const users = await UserModel.find({}, '_id email role');
      resp.json(users);
    } catch (error) {
      next(error);
    }
  },
  getUserById: async (req, resp, next) => {
    try {
      const { uid } = req.params;
      const user = await UserModel.findById(uid, '_id email role');

      if (!user) resp.status(404).json({ error: 'Usuário não encontrado.' });
      resp.json(user);
    } catch (error) {
      next(error);
    }
  },
  createUser: async (req, resp, next) => {
    try {
      const roles = ['admin', 'chef', 'waiter'];
      const { email, password, role } = req.body;

      if (!email) {
        return resp.status(400).json({ error: 'O email é obrigatório.' });
      }

      if (!password) {
        return resp.status(400).json({ error: 'A senha é obrigatória.' });
      }

      if (!role) {
        return resp.status(400).json({ error: 'A função é obrigatória.' });
      }

      if (!roles.includes(role)) {
        return resp.status(400).json({ error: 'A função não é válida.' });
      }

      const userExists = await UserModel.findOne({ email });

      if (userExists) {
        return resp.status(403).json({ error: 'Usuário já cadastrado.' });
      }

      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);

      const response = await UserModel.create({ email, password: passwordHash, role });

      resp.status(201).json({ _id: response._id, email, role });
    } catch (error) {
      next(error);
    }
  },
  updateUser: async (req, resp, next) => {
    try {
      const { uid } = req.params;
      const { email, password, role } = req.body;

      const roles = ['admin', 'chef', 'waiter'];
      if (role && !roles.includes(role)) {
        return resp.status(400).json({ error: 'A função não é válida.' });
      }

      const user = await UserModel.findByIdAndUpdate(uid, { email, role, password });
      if (!user) {
        return resp.status(404).json({ error: 'Usuário não encontrado.' });
      }

      const updatedUser = await UserModel.findById(uid, '_id email role');

      resp.status(200).json(updatedUser);
    } catch (error) {
      next(error);
    }
  },
  deleteUser: async (req, resp, next) => {
    try {
      const { uid } = req.params;
      const user = await UserModel.findById(uid);

      if (!user) resp.status(404).json({ error: 'Usuário não encontrado.' });

      const { _id, email, role } = await UserModel.findByIdAndDelete(uid);
      resp.status(200).json({ _id, email, role });
    } catch (error) {
      next(error);
    }
  },
};
