const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item", // Reference to the Item schema
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        default: 1,
      },
      sizeChosen: {
        type: String,
      },
      addedAt: {
        type: Date,
        default: Date.now, // Tracks the timestamp when the item was added
      },
    },
  ],
});

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
