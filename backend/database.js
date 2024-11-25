const mongoose = require("mongoose");
require("dotenv").config();

const MONGO_URL = process.env.MONGO_URL;
const LOCALMONGODB = process.env.LOCALMONGODB;

const connectDB = async () => {
  try {
    const conn = mongoose.connect(MONGO_URL);
    console.log("MongoDB connected");
    mongoose.connection.on("connected", () => {
      console.log(
        `Connected to database: ${mongoose.connection.db.databaseName}`
      );
    });
  } catch (err) {
    console.error("Database connection error:", err.message);
    process.exit(1);
  }
};

module.exports = { connectDB };
