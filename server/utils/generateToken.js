import jwt from 'jsonwebtoken';

/**
 * Generate a JWT access token.
 * @param {string} userId - The user's MongoDB ObjectId
 * @returns {string} Signed JWT access token (expires in 7 days)
 */
const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

/**
 * Generate a JWT refresh token.
 * @param {string} userId - The user's MongoDB ObjectId
 * @returns {string} Signed JWT refresh token (expires in 30 days)
 */
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '30d',
  });
};

export { generateAccessToken, generateRefreshToken };
