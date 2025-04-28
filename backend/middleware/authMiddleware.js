const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1]; // Authorization: Bearer <token>

  if (!token) {
    return res.status(401).json({ message: 'Token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id; // attach user ID to request
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

module.exports = authenticateToken;
