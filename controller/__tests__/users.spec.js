const bcrypt = require('bcrypt');
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require('../users');
const { User } = require('../../model/User');

jest.mock('../../model/User');

describe('Users Controller', () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  const next = jest.fn();

  const error = new Error('Error');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    const req = {};
    const users = [{ email: 'waiter@example.com' }, { email: 'admin@example.com' }];

    it('should return all users', async () => {
      User.find = jest.fn().mockResolvedValue(users);

      await getUsers(req, res);

      expect(User.find).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(users);
    });

    it('should handle error if cant get users', async () => {
      User.find = jest.fn().mockRejectedValue(error);

      await getUsers(req, res, next);

      expect(User.find).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getUsersById', () => {
    const req = { params: { uid: 12345 } };
    const user = { uid: 12345, email: 'waiter@example.com' };

    it('should return a user', async () => {
      User.findById = jest.fn().mockResolvedValue(user);

      await getUserById(req, res);

      expect(User.findById).toHaveBeenCalledWith(12345, '_id email role');
      expect(res.json).toHaveBeenCalledWith(user);
      expect(res.json).toHaveBeenCalledWith(expect.not.objectContaining(
        {
          password: expect.any(String),
        },
      ));
    });

    it('should handle error if cant find user', async () => {
      User.findById = jest.fn().mockResolvedValue(null);

      await getUserById(req, res, next);

      expect(User.findById).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Usuário não encontrado.' });
    });

    it('should handle error if cant get user', async () => {
      User.findById = jest.fn().mockRejectedValue(error);

      await getUserById(req, res, next);

      expect(User.findById).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('createUser', () => {
    const user = {
      email: 'test@example.com',
      password: 'nothashedPassword',
      role: 'admin',
    };

    let req = {
      body: { ...user },
    };

    it('should success create a new user', async () => {
      bcrypt.genSalt = jest.fn().mockResolvedValue('genSalt');
      bcrypt.hash = jest.fn().mockResolvedValue('hashedPassword');

      User.create = jest.fn().mockResolvedValue(user);

      await createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(bcrypt.hash).toHaveBeenCalledWith('nothashedPassword', 'genSalt');
      expect(User.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'admin',
      });
      expect(res.json).toHaveBeenCalledWith(expect.not.objectContaining(
        {
          password: expect.any(String),
        },
      ));
    });

    it('should return a 400 error if email field is empty', async () => {
      req = {
        body: {
          email: '',
          password: 'nothashedPassword',
          role: 'admin',
        },
      };

      await createUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'O email é obrigatório.' });
    });

    it('should return a 400 error if password field is empty', async () => {
      req = {
        body: {
          email: 'test@example.com',
          password: '',
          role: 'admin',
        },
      };

      await createUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'A senha é obrigatória.' });
    });

    it('should return a 400 error if role field is empty', async () => {
      req = {
        body: {
          email: 'test@example.com',
          password: '12345678',
          role: '',
        },
      };
      await createUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'A função é obrigatória.' });
    });

    it('should return a 400 error if role field is not a valid role', async () => {
      req = {
        body: {
          email: 'test@example.com',
          password: '12345678',
          role: 'user',
        },
      };
      await createUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'A função não é válida.' });
    });

    it('should return a 403 error if user already exists', async () => {
      req = {
        body: { ...user },
      };

      User.findOne = jest.fn().mockResolvedValue(user);
      await createUser(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: user.email });
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Usuário já cadastrado.' });
    });

    it('should handle error if cant create user', async () => {
      req = {
        body: { ...user },
      };

      User.findOne = jest.fn().mockRejectedValue(error);

      await createUser(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('updateUser', () => {
    const user = {
      email: 'test@example.com',
      password: 'nothashedPassword',
      role: 'admin',
    };

    let req = {
      params: { uid: 123456 },
      body: { ...user },
    };

    it('should success update a user', async () => {
      // bcrypt.genSalt = jest.fn().mockResolvedValue('genSalt');
      // bcrypt.hash = jest.fn().mockResolvedValue('hashedPassword');

      User.findByIdAndUpdate = jest.fn().mockResolvedValue(user);
      User.findById = jest.fn().mockResolvedValue(user);

      await updateUser(req, res);

      // expect(bcrypt.hash).toHaveBeenCalledWith('nothashedPassword', 'genSalt');
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(req.params.uid, user);
      expect(User.findById).toHaveBeenCalledWith(req.params.uid, '_id email role');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(user);
    });

    it('should return a 400 error if role field is not a valid role', async () => {
      req = {
        ...req,
        body: {
          ...req.body,
          role: 'user',
        },
      };

      await updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'A função não é válida.' });
    });

    it('should return a 404 error if user is not find', async () => {
      req = {
        ...req,
        body: {
          ...user,
        },
      };

      User.findByIdAndUpdate = jest.fn().mockResolvedValue(null);
      await updateUser(req, res);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(req.params.uid, user);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Usuário não encontrado.' });
    });

    it('should handle error if cant create user', async () => {
      req = {
        ...req,
        body: {
          ...user,
        },
      };

      User.findByIdAndUpdate = jest.fn().mockRejectedValue(error);

      await updateUser(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteUser', () => {
    const req = { params: { uid: 12345 } };
    const user = { _id: 12345, email: 'waiter@example.com', role: 'admin' };
    it('should delete a user', async () => {
      User.findById = jest.fn().mockResolvedValue(user);
      User.findByIdAndDelete = jest.fn().mockResolvedValue(user);

      await deleteUser(req, res);

      expect(User.findById).toHaveBeenCalledWith(12345);
      expect(User.findByIdAndDelete).toHaveBeenCalledWith(12345);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(user);
    });

    it('should handle error if cant find user', async () => {
      User.findById = jest.fn().mockResolvedValue(null);

      await deleteUser(req, res, next);

      expect(User.findById).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Usuário não encontrado.' });
    });

    it('should handle error if cant get user', async () => {
      User.findById = jest.fn().mockRejectedValue(error);

      await deleteUser(req, res, next);

      expect(User.findById).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
