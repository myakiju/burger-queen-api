const { User: UserModel } = require('../model/User');

module.exports = {
  getUsers: (req, resp, next) => {
    // TODO: Implement the necessary function to fetch the `users` collection or table
  },
  createUser: async (req, resp) => {
    try {
      const { email, password, role } = req.body;
      const response = await UserModel.create({ email, password, role });

      resp.status(201).json({ response, message: 'Usuário criado com sucesso' });
    } catch (error) {
      console.error(error);
    }
  },
};
