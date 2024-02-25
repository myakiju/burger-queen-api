const { Schema, model } = require('mongoose');

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'waiter', 'chef'],
      required: true,
    },
  },
  { timestamps: true },
);

const User = model('User', userSchema);

module.exports = { User };
