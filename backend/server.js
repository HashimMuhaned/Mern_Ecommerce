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

const allowedOrigins = [
  "http://localhost:4173", // Development frontend
  "https://mern-ecommerce-frontend-three-beta.vercel.app/", // Deployed frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like Postman or server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(
          new Error("CORS policy: This origin is not allowed"),
          false
        );
      }
    },
    credentials: true, // If you're using cookies or other credentials
  })
);

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
