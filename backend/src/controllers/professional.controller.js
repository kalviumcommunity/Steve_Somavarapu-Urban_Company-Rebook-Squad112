const professionalService = require("../services/professional.service");

/**
 * Controller: GET /api/professional/:id/availability?date=YYYY-MM-DD
 * Returns calendar time slots for the professional on a specific date.
 */
async function getAvailability(req, res, next) {
  try {
    const professionalId = req.params.id;
    const { date } = req.query;

    if (!date || !professionalService.isValidDateFormat(date)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_DATE_FORMAT",
          message: "Date query parameter is required in valid YYYY-MM-DD format.",
        },
      });
    }

    const availability = await professionalService.getProfessionalAvailability({
      professionalId,
      date,
    });

    if (!availability) {
      return res.status(404).json({
        success: false,
        error: {
          code: "PROFESSIONAL_NOT_FOUND",
          message: `Professional not found with ID '${professionalId}'.`,
        },
      });
    }

    return res.status(200).json({
      success: true,
      professionalId: availability.professionalId,
      date: availability.date,
      slots: availability.slots,
    });
  } catch (error) {
    if (error.code === "INVALID_DATE_FORMAT") {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_DATE_FORMAT",
          message: "Date query parameter is required in valid YYYY-MM-DD format.",
        },
      });
    }
    next(error);
  }
}

module.exports = {
  getAvailability,
};
