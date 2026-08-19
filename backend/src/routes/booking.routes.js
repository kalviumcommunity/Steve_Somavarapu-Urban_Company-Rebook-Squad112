const express = require("express");
const { requireAuth } = require("../middleware/auth.middleware");
const { getBookingHistory } = require("../controllers/booking.controller");

const router = express.Router();

/**
 * @route GET /api/bookings/history
 * @desc Get all completed bookings for the authenticated customer
 * @access Protected (Requires Bearer token)
 */
router.get("/history", requireAuth, getBookingHistory);

module.exports = router;
