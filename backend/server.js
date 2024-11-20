require("dotenv").config();

const express = require("express");
// const mongoose = require("mongoose");
const cors = require("cors");

const { connectDB } = require("./database.js");
const EcommerceRoutes = require("./routes/EcommerceRoutes.js");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const PORT = process.env.PORT;
// const MONGO_URL = process.env.MONGO_URL;
const app = express();

// middle ware
app.use(cors());
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
connectDB();

app.listen(PORT, console.log("connected the server"));
