const { Order: OrderModel } = require('../model/Order');

module.exports = {
  getOrders: async (_, resp, next) => {
    try {
      const orders = await OrderModel.find({});
      resp.json(orders);
    } catch (error) {
      next(error);
    }
  },
  getOrderById: async (req, resp, next) => {
    try {
      const { orderId } = req.params;
      const order = await OrderModel.findById(orderId);

      if (!order) resp.status(404).json({ error: 'Pedido não encontrado.' });
      resp.json(order);
    } catch (error) {
      next(error);
    }
  },
  createOrder: async (req, resp, next) => {
    try {
      const {
        userId,
        client,
        products,
      } = req.body;

      if (!userId) resp.status(400).json({ message: 'O id do usuário obrigatório.' });
      if (!client) resp.status(400).json({ message: 'O nome do cliente é obrigatório.' });
      if (Array.isArray(products) && !products.length) resp.status(400).json({ message: 'A lista de produtos é obrigatória.' });

      const { _id } = await OrderModel.create({
        userId, client, products, status: 'pending',
      });

      resp.status(201).json({
        _id, userId, client, products, status: 'pending',
      });
    } catch (error) {
      next(error);
    }
  },
  updateOrder: async (req, resp, next) => {
    try {
      const { orderId } = req.params;
      const {
        userId,
        client,
        products,
        status,
      } = req.body;

      const order = await OrderModel.findByIdAndUpdate(orderId, {
        userId,
        client,
        products,
        status,
      });

      if (!order) resp.status(404).json({ error: 'Pedido não encontrado.' });

      const updatedOrder = await OrderModel.findById(orderId, '_id userId client products status createdAt');

      resp.status(200).json(updatedOrder);
    } catch (error) {
      next(error);
    }
  },
  deleteOrder: async (req, resp, next) => {
    try {
      const { orderId } = req.params;
      const order = await OrderModel.findById(orderId);

      if (!order) resp.status(404).json({ error: 'Pedido não encontrado.' });

      const deletedOrder = await OrderModel.findByIdAndDelete(orderId);

      resp.status(200).json(deletedOrder);
    } catch (error) {
      next(error);
    }
  },
};
