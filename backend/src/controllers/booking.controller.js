const bookingService = require("../services/booking.service");

/**
 * Controller: GET /api/bookings/history
 * Protected endpoint returning paginated completed bookings for the authenticated customer.
 */
async function getBookingHistory(req, res, next) {
  try {
    const firebaseUid = req.user?.uid;

    if (!firebaseUid) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "User context missing from request.",
        },
      });
    }

    const { page, limit } = req.query;

    const { bookings, pagination } = await bookingService.findCompletedBookingsByCustomer({
      firebaseUid,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      bookings,
      pagination,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller: POST /api/bookings/rebook
 * Initiates the one-click rebook flow by loading customer, booking, professional,
 * and availability details in parallel (FR-002, FR-003).
 */
async function initiateRebook(req, res, next) {
  try {
    const firebaseUid = req.user?.uid;

    if (!firebaseUid) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "User context missing from request.",
        },
      });
    }

    const originalBookingId = req.body?.originalBookingId || req.body?.bookingId;

    if (!originalBookingId) {
      return res.status(400).json({
        success: false,
        error: {
          code: "MISSING_BOOKING_ID",
          message: "originalBookingId is required in request body.",
        },
      });
    }

    const requestedDate = req.body?.date || req.query?.date;

    const rebookData = await bookingService.initiateRebookFlow({
      firebaseUid,
      originalBookingId,
      requestedDate,
    });

    if (!rebookData) {
      return res.status(404).json({
        success: false,
        error: {
          code: "BOOKING_NOT_FOUND",
          message: "Requested booking was not found.",
        },
      });
    }

    return res.status(200).json({
      success: true,
      ...rebookData,
    });
  } catch (error) {
    if (error.code === "INVALID_PARAMETERS" || error.code === "INVALID_DATE_FORMAT") {
      return res.status(400).json({
        success: false,
        error: {
          code: error.code,
          message: "Invalid request parameters provided.",
        },
      });
    }
    if (error.code === "BOOKING_NOT_FOUND") {
      console.warn(`[Rebook Error] Booking not found: ${error.message}`);
      return res.status(404).json({
        success: false,
        error: {
          code: "BOOKING_NOT_FOUND",
          message: "Requested booking was not found.",
        },
      });
    }
    next(error);
  }
}

/**
 * Controller: POST /api/bookings/confirm
 * Atomically confirms and creates a rebooked service appointment (FR-005).
 */
async function confirmRebooking(req, res, next) {
  try {
    const firebaseUid = req.user?.uid;

    if (!firebaseUid) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "User context missing from request.",
        },
      });
    }

    const originalBookingId = req.body?.originalBookingId || req.body?.rebookRequestId;
    const professionalId = req.body?.professionalId;
    const slot = req.body?.slot;

    if (!originalBookingId || !professionalId || !slot?.date || !slot?.startTime || !slot?.endTime) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_PARAMETERS",
          message: "originalBookingId, professionalId, and slot (with date, startTime, endTime) are required.",
        },
      });
    }

    const confirmedBooking = await bookingService.confirmRebooking({
      firebaseUid,
      originalBookingId,
      professionalId,
      slot,
    });

    return res.status(200).json({
      success: true,
      booking: confirmedBooking,
    });
  } catch (error) {
    if (error.code === "INVALID_PARAMETERS" || error.code === "INVALID_DATE_FORMAT") {
      return res.status(400).json({
        success: false,
        error: {
          code: error.code,
          message: "Invalid request parameters provided.",
        },
      });
    }

    if (error.code === "SLOT_UNAVAILABLE") {
      return res.status(409).json({
        success: false,
        error: {
          code: "SLOT_UNAVAILABLE",
          message: "Selected time slot is no longer available. Please select another slot.",
        },
      });
    }

    if (error.code === "BOOKING_NOT_FOUND") {
      console.warn(`[Rebook Error] Booking not found: ${error.message}`);
      return res.status(404).json({
        success: false,
        error: {
          code: "BOOKING_NOT_FOUND",
          message: "Requested booking was not found.",
        },
      });
    }

    if (error.code === "CUSTOMER_NOT_FOUND") {
      console.warn(`[Rebook Error] Customer not found: ${error.message}`);
      return res.status(404).json({
        success: false,
        error: {
          code: "CUSTOMER_NOT_FOUND",
          message: "Customer profile was not found.",
        },
      });
    }

    next(error);
  }
}

module.exports = {
  getBookingHistory,
  initiateRebook,
  confirmRebooking,
};
