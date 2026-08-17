const { getFirebaseAuth } = require("../config/firebase");

function getHealth(req, res) {
  return res.status(200).json({
    success: true,
    message: "Backend is running",
  });
}

function getReadiness(req, res) {
  const firebaseAuth = getFirebaseAuth();

  if (!firebaseAuth) {
    return res.status(503).json({
      success: false,
      error: {
        code: "SERVICE_UNAVAILABLE",
        message: "Firebase Authentication service is uninitialized or unconfigured.",
      },
    });
  }

  return res.status(200).json({
    success: true,
    message: "Service is ready",
  });
}

module.exports = {
  getHealth,
  getReadiness,
};
