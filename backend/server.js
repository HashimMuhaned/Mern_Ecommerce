require("dotenv").config();

const express = require("express");
// const mongoose = require("mongoose");
const cors = require("cors");

const { connectDB } = require("./database.js");
const EcommerceRoutes = require("./routes/EcommerceRoutes.js");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

// const PORT = process.env.PORT || 8080;
// const MONGO_URL = process.env.MONGO_URL;
const app = express();

app.use(
  cors({
    origin: "https://mern-ecommerce-frontend-rouge.vercel.app",
    credentials: true, // If you're using cookies or other credentials
  })
);

app.options("*", cors());

app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.sendStatus(204); // Respond successfully
  } else {
    next();
  }
});

// middle ware
app.use(cookieParser());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.json());
app.use("/api", EcommerceRoutes);

// debuggin purposes
app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

// connecting to the database
connectDB()
  .then(() => {
    console.log("Database connected successfully.");
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
  });

// Log when the server is deployed successfully
console.log("Backend deployed successfully.");

// app.listen(PORT, console.log("connected the server"));

module.exports = app;
