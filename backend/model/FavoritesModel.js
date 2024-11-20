const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item", // Reference the Item model
        required: true,
      },
      addedAt: {
        type: Date,
        default: Date.now, // Tracks the timestamp when the item was added
      },
    },
  ],
});

// Virtual field to get the number of items in the favorites
favoriteSchema.virtual("itemCount").get(function () {
  return this.items.length;
});

const Favorite = mongoose.model("Favorite", favoriteSchema);

module.exports = Favorite;
