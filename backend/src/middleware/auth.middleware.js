const { getFirebaseAuth } = require("../config/firebase");

async function requireAuth(req, res, next) {
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

  const firebaseAuth = getFirebaseAuth();

  if (!firebaseAuth) {
    return res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Firebase authentication service is uninitialized or unconfigured.",
      },
    });
  }

  try {
    const decodedToken = await firebaseAuth.verifyIdToken(token);

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || null,
      emailVerified: decodedToken.email_verified || false,
      name: decodedToken.name || null,
      picture: decodedToken.picture || null,
    };

    return next();
  } catch (error) {
    // Return clean 401 without exposing raw internal Firebase stack traces
    return res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Invalid or expired token.",
      },
    });
  }
}

module.exports = {
  requireAuth,
};
