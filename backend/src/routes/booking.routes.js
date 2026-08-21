const express = require("express");
const { requireAuth } = require("../middleware/auth.middleware");
const {
  getBookingHistory,
  initiateRebook,
  confirmRebooking,
} = require("../controllers/booking.controller");

const router = express.Router();

/**
 * @route GET /api/bookings/history
 * @desc Get all completed bookings for the authenticated customer
 * @access Protected (Requires Bearer token)
 */
router.get("/history", requireAuth, getBookingHistory);

/**
 * @route POST /api/bookings/rebook
 * @desc Initiate one-click rebooking with parallel loaded profile, booking, and availability details
 * @access Protected (Requires Bearer token)
 */
router.post("/rebook", requireAuth, initiateRebook);

/**
 * @route POST /api/bookings/confirm
 * @desc Atomically confirm slot and create rebooked booking record
 * @access Protected (Requires Bearer token)
 */
router.post("/confirm", requireAuth, confirmRebooking);

module.exports = router;
