const express = require("express");
const { requireAuth } = require("../middleware/auth.middleware");
const { getCurrentUser } = require("../controllers/auth.controller");

const router = express.Router();

router.get("/me", requireAuth, getCurrentUser);

module.exports = router;
