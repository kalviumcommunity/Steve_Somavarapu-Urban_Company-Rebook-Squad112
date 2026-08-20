const express = require("express");
const { requireAuth } = require("../middleware/auth.middleware");
const { getAvailability } = require("../controllers/professional.controller");

const router = express.Router();

/**
 * @route GET /api/professional/:id/availability?date=YYYY-MM-DD
 * @desc Get available time slots for a professional on a given date
 * @access Protected (Requires Bearer token)
 */
router.get("/:id/availability", requireAuth, getAvailability);

module.exports = router;
