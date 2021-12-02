const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
const app = express();
const dotenv = require("dotenv").config();
const cors = require("cors");

app.use(formidable());
app.use(cors);

mongoose.connect("mongodb://localhost:27017/vinted_reprise");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

//Export routes
const userRoutes = require("./routers/user");
app.use(userRoutes);
const offerRoutes = require("./routers/offer");
app.use(offerRoutes);

app.all("*"),
  (req, res) => {
    res.json({ Message: "Page not Found" });
  };

app.listen(process.env.PORT_SERVER, () => {
  console.log(`Server started on port ${process.env.PORT_SERVER}`);
});
