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
  "https://mern-ecommerce-frontend-of3877ez1-hashims-projects-1d68b3df.vercel.app",
  "https://mern-ecommerce-frontend-jcmqogpn4-hashims-projects-1d68b3df.vercel.app",
  "https://mern-ecommerce-frontend-git-main-hashims-projects-1d68b3df.vercel.app/",
  "https://mern-ecommerce-frontend-eta-ten.vercel.app",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
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
app.use(express.urlencoded({ extended: true }));
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
