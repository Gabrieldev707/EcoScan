const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

function toAuthUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    points: user.points,
    level: user.level,
  };
}

function signToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },
  );
}

async function register(req, res, next) {
  try {
    const { name, email, password } = req.validated.body;
    const existingUser = await User.findOne({ email }).select('_id');

    if (existingUser) {
      const error = new Error('Email already registered');
      error.statusCode = 409;
      error.isOperational = true;
      throw error;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: passwordHash });
    const token = signToken(user);

    res.status(201).json({ token, user: toAuthUser(user) });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.validated.body;
    const user = await User.findOne({ email }).select('+password name email points level');

    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      error.isOperational = true;
      throw error;
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      error.isOperational = true;
      throw error;
    }

    const token = signToken(user);
    res.json({ token, user: toAuthUser(user) });
  } catch (error) {
    next(error);
  }
}

function me(req, res) {
  res.json({ user: toAuthUser(req.user) });
}

function logout(_req, res) {
  res.json({ message: 'Logged out successfully', errors: [] });
}

module.exports = { register, login, me, logout, toAuthUser };
