const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the user making the purchase
    required: true,
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      status: {
        type: String,
        default: "Pending", // Individual item status
      },
    },
  ],
  totalPrice: {
    type: Number,
    required: true,
  },
  userLocation: {
    address: { type: String, required: true },
    city: { type: String, required: true },
  },
  status: {
    type: String,
    default: "Pending", // New field for overall order status
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
