const jwt = require('jsonwebtoken');

const User = require('../models/User');

async function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      const error = new Error('Authentication token is required');
      error.statusCode = 401;
      error.isOperational = true;
      throw error;
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select('_id name email points level');

    if (!user) {
      const error = new Error('Invalid authentication token');
      error.statusCode = 401;
      error.isOperational = true;
      throw error;
    }

    req.user = user;
    next();
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 401;
      error.isOperational = true;
      error.message = 'Invalid authentication token';
    }
    next(error);
  }
}

module.exports = { requireAuth };
