const jwt = require("jsonwebtoken");
const User = require("../models/user");

const JWT_SECRET = "your_jwt_secret";

const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization").replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new Error();
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Please authenticate" });
  }
};

module.exports = authMiddleware;
