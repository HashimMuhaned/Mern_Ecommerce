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
    url: { type: String, required: false },
    public_id: { type: String, required: false },
  },
  image2: {
    url: { type: String, required: false },
    public_id: { type: String, required: false },
  },
  image3: {
    url: { type: String, required: false },
    public_id: { type: String, required: false },
  },
  image4: {
    url: { type: String, required: false },
    public_id: { type: String, required: false },
  },
  image5: {
    url: { type: String, required: false },
    public_id: { type: String, required: false },
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
