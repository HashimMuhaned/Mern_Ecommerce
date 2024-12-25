const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  subCategory: {
    type: String,
    required: true,
  },
  isBestseller: {
    type: Boolean,
    default: false,
  },
  image1: {
    type: String,
  },
  image2: {
    type: String,
  },
  image3: {
    type: String,
  },
  image4: {
    type: String,
  },
  image5: {
    type: String,
  },
  size: [{ type: String }], // Array of strings
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  // Tracking field
  viewHistory: [
    {
      date: {
        type: Date,
        default: Date.now, // Timestamp when the view occurs
      },
      count: {
        type: Number,
        default: 1, // Can be used for counting views in batches
      },
    },
  ],
  salesCount: { type: Number, default: 0 }, // Total sales count
  salesHistory: [
    {
      date: { type: Date, default: Date.now }, // Date of the sale
      quantity: { type: Number, required: true }, // Quantity sold
    },
  ],
});

const Item = mongoose.model("Item", itemSchema);

module.exports = Item;
