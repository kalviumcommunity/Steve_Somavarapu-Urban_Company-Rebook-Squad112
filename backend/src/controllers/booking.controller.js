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

module.exports = {
  getBookingHistory,
};
