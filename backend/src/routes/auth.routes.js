const express = require("express");
const { requireAuth } = require("../middleware/auth.middleware");
const { login, register, getCurrentUser } = require("../controllers/auth.controller");

const router = express.Router();

// Public auth endpoints
router.post("/register", register);
router.post("/login", login);

// Protected auth endpoints
router.get("/me", requireAuth, getCurrentUser);

module.exports = router;
