const { verifyToken } = require("../utils/jwt");

/**
 * Express middleware to enforce JWT authentication.
 * Extracts Bearer token from Authorization header and attaches decoded user to req.user.
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication required. Authorization header missing.",
      },
    });
  }

  const match = typeof authHeader === "string" ? authHeader.match(/^Bearer\s+(.+)$/i) : null;

  if (!match) {
    return res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Invalid authorization format. Expected 'Bearer <token>'.",
      },
    });
  }

  const token = match[1].trim();

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication token missing.",
      },
    });
  }

  try {
    const decoded = verifyToken(token);

    req.user = {
      id: decoded.id || decoded.userId || decoded.uid,
      uid: decoded.id || decoded.userId || decoded.uid, // backwards-compatible alias
      email: decoded.email || null,
      name: decoded.name || null,
      role: decoded.role || "CUSTOMER",
    };

    return next();
  } catch (error) {
    const isExpired = error.name === "TokenExpiredError";
    return res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: isExpired ? "Token has expired. Please sign in again." : "Invalid authentication token.",
      },
    });
  }
}

module.exports = {
  requireAuth,
};
