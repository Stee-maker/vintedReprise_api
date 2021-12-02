const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  try {
    const userToken = req.headers.authorization.replace("Bearer ", "");
    const user = await User.findOne({ toke: userToken }).select("_id account");
    if (user) {
      req.user = user;
      next();
    } else {
      res.status(404).json({ Message: "Unauthorized" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = isAuthenticated;
