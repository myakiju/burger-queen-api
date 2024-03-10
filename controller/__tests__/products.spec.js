const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../products');
const { Product } = require('../../model/Product');

jest.mock('../../model/Product');

describe('Products Controller', () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  const next = jest.fn();

  const error = new Error('Error');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProducts', () => {
    const req = {};
    it('should return all products', async () => {
      const products = [{ name: 'products 1' }, { name: 'products 2' }];

      Product.find = jest.fn().mockResolvedValue(products);

      await getProducts(req, res);

      expect(Product.find).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(products);
    });

    it('should handle error if cant get products', async () => {
      Product.find = jest.fn().mockRejectedValue(error);

      await getProducts(req, res, next);

      expect(Product.find).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getProductById', () => {
    const req = { params: { productId: 12345 } };
    const product = { _id: 12345, name: 'Product 1' };
    it('should return a product', async () => {
      Product.findById = jest.fn().mockResolvedValue(product);

      await getProductById(req, res);

      expect(Product.findById).toHaveBeenCalledWith(12345, '_id name price image type createdAt');
      expect(res.json).toHaveBeenCalledWith(product);
    });

    it('should handle error if cant find product', async () => {
      Product.findById = jest.fn().mockResolvedValue(null);

      await getProductById(req, res, next);

      expect(Product.findById).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Produto não encontrado.' });
    });

    it('should handle error if cant get product', async () => {
      Product.findById = jest.fn().mockRejectedValue(error);

      await getProductById(req, res, next);

      expect(Product.findById).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('createProduct', () => {
    const product = {
      name: 'Product 1',
      price: 12,
      image: 'https://example.com',
      type: 'lunch',
    };

    let req = {
      body: { ...product },
    };
    it('should success create a new product', async () => {
      Product.create = jest.fn().mockResolvedValue(product);

      await createProduct(req, res);

      expect(Product.create).toHaveBeenCalledWith(product);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining(product));
    });

    it('should return a 400 error if name field is empty', async () => {
      req = {
        body: {
          name: '',
          price: 12,
          image: 'https://example.com',
          type: 'lunch',
        },
      };

      await createProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'O nome do produto é obrigatório.' });
    });

    it('should return a 400 error if price field is empty', async () => {
      req = {
        body: {
          name: 'Product 1',
          price: '',
          image: 'https://example.com',
          type: 'lunch',
        },
      };

      await createProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'O preço do produto é obrigatório.' });
    });

    it('should return a 400 error if image field is empty', async () => {
      req = {
        body: {
          name: 'Product 1',
          price: 12,
          image: '',
          type: 'lunch',
        },
      };

      await createProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'A imagem do produto é obrigatória.' });
    });

    it('should return a 400 error if type field is empty', async () => {
      req = {
        body: {
          name: 'Product 1',
          price: 12,
          image: 'https://example.com',
          type: '',
        },
      };

      await createProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'O tipo do produto é obrigatório.' });
    });

    it('should return a 403 error if product already exists', async () => {
      req = {
        body: {
          ...product,
        },
      };

      Product.findOne = jest.fn().mockResolvedValue(product);
      await createProduct(req, res);

      expect(Product.findOne).toHaveBeenCalledWith({ name: product.name });
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Produto já cadastrado.' });
    });

    it('should handle error if cant create product', async () => {
      req = {
        body: {
          ...product,
        },
      };

      Product.findOne = jest.fn().mockRejectedValue(error);

      await createProduct(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('updateProduct', () => {
    const product = {
      name: 'Product 1',
      price: 12,
      image: 'https://example.com',
      type: 'lunch',
    };

    const req = {
      params: { productId: 123456 },
      body: { ...product },
    };
    it('should success update a product', async () => {
      Product.findByIdAndUpdate = jest.fn().mockResolvedValue(product);
      Product.findById = jest.fn().mockResolvedValue(product);

      await updateProduct(req, res);

      // expect(bcrypt.hash).toHaveBeenCalledWith('nothashedPassword', 'genSalt');
      expect(Product.findByIdAndUpdate).toHaveBeenCalledWith(req.params.productId, product);
      expect(Product.findById).toHaveBeenCalledWith(req.params.productId, '_id name price image type createdAt');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(product);
    });

    it('should return a 404 error if product is not find', async () => {
      Product.findByIdAndUpdate = jest.fn().mockResolvedValue(null);
      await updateProduct(req, res);

      expect(Product.findByIdAndUpdate).toHaveBeenCalledWith(req.params.productId, product);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Produto não encontrado.' });
    });

    it('should handle error if cant create product', async () => {
      Product.findByIdAndUpdate = jest.fn().mockRejectedValue(error);

      await updateProduct(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteProduct', () => {
    const req = { params: { productId: 12345 } };
    const product = { _id: 12345, name: 'Product 1' };

    it('should delete a product', async () => {
      Product.findById = jest.fn().mockResolvedValue(product);
      Product.findByIdAndDelete = jest.fn().mockResolvedValue(product);

      await deleteProduct(req, res);

      expect(Product.findById).toHaveBeenCalledWith(12345);
      expect(Product.findByIdAndDelete).toHaveBeenCalledWith(12345);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(product);
    });

    it('should handle error if cant find product', async () => {
      Product.findById = jest.fn().mockResolvedValue(null);

      await deleteProduct(req, res, next);

      expect(Product.findById).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Produto não encontrado.' });
    });

    it('should handle error if cant get product', async () => {
      Product.findById = jest.fn().mockRejectedValue(error);

      await deleteProduct(req, res, next);

      expect(Product.findById).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
