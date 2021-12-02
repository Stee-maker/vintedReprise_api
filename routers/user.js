const express = require("express");
const router = express.Router();
//identification packages
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");
const cloudinary = require("cloudinary").v2;

//Import User model
const User = require("../models/User");
const { findOne } = require("../models/User");

router.post("/user/signup", async (req, res) => {
  try {
    const email = req.fields.email;
    const password = req.fields.password;
    const username = req.fields.username;
    const phone = req.fields.phone;
    const account = {
      username: req.fields.username,
      phone: req.fields.phone,
    };
    // Check if username is already used if not you can use it
    //the username is not filled in
    //check if username is already in the DB

    if (username) {
      const existingEmail = await User.findOne({ email: email });

      //the email entered during registration already exists in the database
      if (!existingEmail) {
        //Password encrypted
        const salt = uid2(16);
        const hash = SHA256(password + salt).toString(encBase64);
        const token = uid2(16);

        //Create User in the DB
        const newUser = new User({
          email: email,
          account: account,
          token: token,
          hash: hash,
          salt: salt,
        });
        await newUser.save();
        res.status(200).json({
          _id: newUser._id,
          token: newUser.token,
          account: newUser.account,
        });
      } else {
        res.status(400).json({ Message: "email already exists" });
      }
    } else {
      res.status(400).json({ Message: "Username is not defined" });
    }
  } catch (error) {
    console.error(error.message);
  }
});

//Login page
router.post("/user/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.fields.email });
    const password = req.fields.password;
    // console.log(user);
    // console.log(user.token);

    if (user && password) {
      const hashUser = SHA256(password + user.salt).toString(encBase64);
      if (hashUser === user.hash) {
        res.status(200).json({
          _id: user._id,
          token: user.token,
          account: user.account,
        });
      } else {
        res.status(400).json({ Message: "Password Wrong" });
      }
    } else {
      res.status(404).json({ Message: "Email not found" });
    }
  } catch (error) {
    console.error(error.message);
  }
});

module.exports = router;
