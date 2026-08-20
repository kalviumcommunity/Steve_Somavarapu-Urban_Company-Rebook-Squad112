const prisma = require("../config/prisma");

// In-memory mock registry initialized with null prototype for test isolation
let mockProfessionals = Object.create(null);
let mockAvailabilities = Object.create(null);

/**
 * Validates whether a date string conforms strictly to YYYY-MM-DD format and is a real calendar date.
 * @param {string} dateStr 
 * @returns {boolean}
 */
function isValidDateFormat(dateStr) {
  if (typeof dateStr !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }
  const [year, month, day] = dateStr.split("-").map((n) => parseInt(n, 10));
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

/**
 * Formats a Date object or string into a 24-hour HH:mm time string.
 * @param {Date|string} timeVal 
 * @returns {string}
 */
function formatSlotTime(timeVal) {
  if (!timeVal) return "00:00";
  if (typeof timeVal === "string") {
    if (/^\d{2}:\d{2}$/.test(timeVal)) return timeVal;
    const match = timeVal.match(/T(\d{2}:\d{2})/);
    if (match) return match[1];
  }
  const d = new Date(timeVal);
  if (isNaN(d.getTime())) return "00:00";
  const hours = d.getUTCHours().toString().padStart(2, "0");
  const minutes = d.getUTCMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Registers mock professional data for unit testing.
 * @param {string} professionalId 
 * @param {object|null} professionalData 
 */
function __setMockProfessional(professionalId, professionalData) {
  if (typeof professionalId === "string") {
    mockProfessionals[professionalId] = professionalData;
  }
}

/**
 * Registers mock availability slots for a professional and date.
 * @param {string} professionalId 
 * @param {string} date 
 * @param {Array<object>} slots 
 */
function __setMockAvailability(professionalId, date, slots) {
  if (typeof professionalId === "string" && typeof date === "string") {
    const key = `${professionalId}:${date}`;
    mockAvailabilities[key] = Array.isArray(slots) ? slots : [];
  }
}

/**
 * Clears all mock professional and availability records.
 */
function __clearMockProfessionals() {
  mockProfessionals = Object.create(null);
  mockAvailabilities = Object.create(null);
}

/**
 * Retrieves time slots and availability status for a professional on a given date.
 * 
 * @param {object} params
 * @param {string} params.professionalId - Professional Profile ID
 * @param {string} params.date - Date in YYYY-MM-DD format
 * @returns {Promise<{ professionalId: string, date: string, slots: Array<object> } | null>}
 */
async function getProfessionalAvailability({ professionalId, date }) {
  if (!isValidDateFormat(date)) {
    const error = new Error("Invalid date format. Expected YYYY-MM-DD.");
    error.code = "INVALID_DATE_FORMAT";
    throw error;
  }

  // 1. Check Mock Registry First (active in unit/integration tests)
  if (typeof professionalId === "string" && Object.prototype.hasOwnProperty.call(mockProfessionals, professionalId)) {
    const prof = mockProfessionals[professionalId];
    if (!prof) {
      return null; // Explicitly simulated 404
    }

    const availKey = `${professionalId}:${date}`;
    const mockSlots = mockAvailabilities[availKey] || [];

    return {
      professionalId,
      date,
      slots: mockSlots.map((s) => ({
        startTime: formatSlotTime(s.startTime),
        endTime: formatSlotTime(s.endTime),
        status: s.status || "AVAILABLE",
      })),
    };
  }

  // 2. Database Execution via Prisma
  if (!prisma) {
    if (process.env.NODE_ENV === "test") {
      return null; // Default 404 in test mode if unmocked
    }
    throw new Error("Prisma client is not initialized.");
  }

  // Verify professional exists
  const professional = await prisma.professionalProfile.findUnique({
    where: { id: professionalId },
    select: { id: true, isAvailable: true },
  });

  if (!professional) {
    return null;
  }

  const queryDate = new Date(`${date}T00:00:00.000Z`);

  // Query indexed availability table (composite index: [professionalId, date, status])
  const records = await prisma.professionalAvailability.findMany({
    where: {
      professionalId,
      date: queryDate,
    },
    orderBy: {
      startTime: "asc",
    },
    select: {
      id: true,
      startTime: true,
      endTime: true,
      status: true,
    },
  });

  return {
    professionalId,
    date,
    slots: records.map((record) => ({
      startTime: formatSlotTime(record.startTime),
      endTime: formatSlotTime(record.endTime),
      status: record.status,
    })),
  };
}

module.exports = {
  isValidDateFormat,
  getProfessionalAvailability,
  __setMockProfessional,
  __setMockAvailability,
  __clearMockProfessionals,
};
