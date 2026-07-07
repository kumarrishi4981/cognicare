import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';

/**
 * Protect routes — verify JWT access token from Authorization header.
 * Attaches the authenticated user (without password) to req.user.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized — no token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select('-password');

    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized — user not found');
    }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      res.status(401);
      throw new Error('Not authorized — invalid or expired token');
    }
    throw error;
  }
});

/**
 * Authorize by role — restrict access to specific user roles.
 * Must be used after the protect middleware.
 * @param  {...string} roles - Allowed roles (e.g. 'caregiver', 'patient')
 * @returns {import('express').RequestHandler}
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized — no user in request');
    }

    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`Access denied — role '${req.user.role}' is not authorized for this action`);
    }

    next();
  };
};

export { protect, authorize };
