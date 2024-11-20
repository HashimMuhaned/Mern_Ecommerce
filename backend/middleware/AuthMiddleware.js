const jwt = require("jsonwebtoken");
require("dotenv").config();
const token_SECRET_KEY = process.env.TOKEN_SECRET_KEY;

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token; // Assuming the JWT is stored in a cookie

  if (!token) {
    return res.status(401).json({ message: 'Access denied, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, token_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
};


module.exports = { authMiddleware };
