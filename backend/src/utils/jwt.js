const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "urban-company-rebook-jwt-secret-key-2026";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

/**
 * Signs a payload into a JWT token
 * @param {object} payload - e.g. { id, email, role, name }
 * @param {string} [expiresIn]
 * @returns {string} Signed JWT token
 */
function generateToken(payload, expiresIn = JWT_EXPIRES_IN) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Verifies and decodes a JWT token
 * @param {string} token
 * @returns {object} Decoded payload
 */
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = {
  JWT_SECRET,
  generateToken,
  verifyToken,
};
