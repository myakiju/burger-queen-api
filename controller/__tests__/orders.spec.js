const {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
} = require('../orders');
const { Order } = require('../../model/Order');

jest.mock('../../model/Order');

describe('Orders Controller', () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  const next = jest.fn();

  const error = new Error('Error');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrders', () => {
    const req = {};
    it('should return all Orders', async () => {
      const orders = [{
        userId: 'Orders 1',
        client: 'client',
        products: [],
        status: 'pending',
      }];

      Order.find = jest.fn().mockResolvedValue(orders);

      await getOrders(req, res);

      expect(Order.find).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(orders);
    });

    it('should handle error if cant get orders', async () => {
      Order.find = jest.fn().mockRejectedValue(error);

      await getOrders(req, res, next);

      expect(Order.find).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getProductById', () => {
    const req = { params: { orderId: 12345 } };
    const order = {
      _id: 12345,
      userId: 'Orders 1',
      client: 'client',
      products: [],
      status: 'pending',
    };

    it('should return a order', async () => {
      Order.findById = jest.fn().mockResolvedValue(order);

      await getOrderById(req, res);

      expect(Order.findById).toHaveBeenCalledWith(12345);
      expect(res.json).toHaveBeenCalledWith(order);
    });

    it('should handle error if cant find order', async () => {
      Order.findById = jest.fn().mockResolvedValue(null);

      await getOrderById(req, res, next);

      expect(Order.findById).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Pedido não encontrado.' });
    });

    it('should handle error if cant get order', async () => {
      Order.findById = jest.fn().mockRejectedValue(error);

      await getOrderById(req, res, next);

      expect(Order.findById).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('createOrder', () => {
    const order = {
      userId: 'Orders 1',
      client: 'client',
      products: [{}],
      status: 'pending',
    };

    let req = {
      body: { ...order },
    };

    it('should success create a new order', async () => {
      Order.create = jest.fn().mockResolvedValue(order);

      await createOrder(req, res);

      expect(Order.create).toHaveBeenCalledWith(order);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        ...order, status: 'pending',
      }));
    });

    it('should return a 400 error if userId field is empty', async () => {
      req = {
        body: {
          userId: '',
          client: 'client',
          products: [],
          status: 'pending',
        },
      };

      await createOrder(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'O id do usuário é obrigatório.' });
    });

    it('should return a 400 error if cliennt field is empty', async () => {
      req = {
        body: {
          userId: 'Orders 1',
          client: '',
          products: [],
          status: 'pending',
        },
      };

      await createOrder(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'O nome do cliente é obrigatório.' });
    });

    it('should return a 400 error if products field is empty', async () => {
      req = {
        body: {
          userId: 'Orders 1',
          client: 'client',
          products: [],
          status: 'pending',
        },
      };

      await createOrder(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'A lista de produtos é obrigatória.' });
    });

    it('should handle error if cant create order', async () => {
      req = {
        body: {
          ...order,
        },
      };

      Order.create = jest.fn().mockRejectedValue(error);

      await createOrder(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('updateProduct', () => {
    const order = {
      userId: 'Orders 1',
      client: 'client',
      products: [{}],
      status: 'pending',
    };

    const req = {
      params: { orderId: 123456 },
      body: { ...order },
    };
    it('should success update a order', async () => {
      Order.findByIdAndUpdate = jest.fn().mockResolvedValue(order);
      Order.findById = jest.fn().mockResolvedValue(order);

      await updateOrder(req, res);

      expect(Order.findByIdAndUpdate).toHaveBeenCalledWith(req.params.orderId, order);
      expect(Order.findById).toHaveBeenCalledWith(req.params.orderId, '_id userId client products status createdAt');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(order);
    });

    it('should return a 404 error if order is not find', async () => {
      Order.findByIdAndUpdate = jest.fn().mockResolvedValue(null);
      await updateOrder(req, res);

      expect(Order.findByIdAndUpdate).toHaveBeenCalledWith(req.params.orderId, order);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Pedido não encontrado.' });
    });

    it('should handle error if cant create order', async () => {
      Order.findByIdAndUpdate = jest.fn().mockRejectedValue(error);

      await updateOrder(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteOrder', () => {
    const req = { params: { orderId: 12345 } };
    const order = {
      _id: 12345,
      userId: 'Orders 1',
      client: 'client',
      products: [{}],
      status: 'pending',
    };

    it('should delete a order', async () => {
      Order.findById = jest.fn().mockResolvedValue(order);
      Order.findByIdAndDelete = jest.fn().mockResolvedValue(order);

      await deleteOrder(req, res);

      expect(Order.findById).toHaveBeenCalledWith(12345);
      expect(Order.findByIdAndDelete).toHaveBeenCalledWith(12345);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(order);
    });

    it('should handle error if cant find order', async () => {
      Order.findById = jest.fn().mockResolvedValue(null);

      await deleteOrder(req, res, next);

      expect(Order.findById).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Pedido não encontrado.' });
    });

    it('should handle error if cant delete order', async () => {
      Order.findById = jest.fn().mockRejectedValue(error);

      await deleteOrder(req, res, next);

      expect(Order.findById).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
