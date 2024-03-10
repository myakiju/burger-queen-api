const { Schema, model } = require('mongoose');
const { productSchema } = require('./Product');

const orderSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    client: {
      type: String,
      required: true,
    },
    products: {
      type: [productSchema],
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

const Order = model('Order', orderSchema);

module.exports = { Order };
