const { Product: PoductModel } = require('../model/Product');

module.exports = {
  getProducts: async (_, resp, next) => {
    try {
      const products = await PoductModel.find();
      resp.json(products);
    } catch (error) {
      next(error);
    }
  },
  getProductById: async (req, resp, next) => {
    try {
      const { productId } = req.params;
      const product = await PoductModel.findById(productId);

      if (!product) resp.status(404).json({ message: 'Produto não encontrado.' });
      resp.json(product);
    } catch (error) {
      next(error);
    }
  },
  createProduct: async (req, resp, next) => {
    try {
      const {
        name,
        price,
        image,
        type,
      } = req.body;

      if (!name) resp.status(422).json({ message: 'O nome é obrigatório.' });
      if (!price) resp.status(422).json({ message: 'O preço é obrigatório.' });
      if (!image) resp.status(422).json({ message: 'A imagem é obrigatória.' });
      if (!type) resp.status(422).json({ message: 'O tipo não é obrigatório.' });

      const productExists = await PoductModel.findOne({ name });

      if (productExists) resp.status(422).json({ message: 'Produto já cadastrado.' });

      const response = await PoductModel.create({
        name, price, image, type,
      });

      resp.status(201).json({ response, message: 'Produto criado com sucesso' });
    } catch (error) {
      next(error);
    }
  },
  updateProduct: async (req, resp, next) => {
    try {
      const { productId } = req.params;
      const {
        name,
        price,
        image,
        type,
      } = req.body;

      const product = await PoductModel.findByIdAndUpdate(productId, {
        name,
        price,
        image,
        type,
      });

      if (!product) resp.status(404).json({ message: 'Produto não encontrado.' });

      resp.status(200).json({ message: 'Produto atualizado com sucesso', product });
    } catch (error) {
      next(error);
    }
  },
  deleteProduct: async (req, resp, next) => {
    try {
      const { productId } = req.params;
      const user = await PoductModel.findById(productId);

      if (!user) resp.status(404).json({ message: 'Produto não encontrado.' });

      const deletedProduct = await PoductModel.findByIdAndDelete(productId);
      resp.status(200).json({ message: 'Produto deletado com sucesso', product: deletedProduct });
    } catch (error) {
      next(error);
    }
  },
};
