const prisma = require("../config/prisma");

function getHealth(req, res) {
  return res.status(200).json({
    success: true,
    message: "Backend is running",
  });
}

function getReadiness(req, res) {
  return res.status(200).json({
    success: true,
    message: "Service is ready",
    auth: "JWT",
  });
}

module.exports = {
  getHealth,
  getReadiness,
};
