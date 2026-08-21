const prisma = require("../config/prisma");
const { parallelFetch } = require("../utils/parallelFetch");
const customerService = require("./customer.service");
const professionalService = require("./professional.service");

// In-memory mock registry initialized with null prototype for test isolation
let mockBookings = Object.create(null);
let mockBookingsById = Object.create(null);

/**
 * Checks if a mock bookings list is registered for a given Firebase UID.
 * @param {string} firebaseUid 
 * @returns {boolean}
 */
function hasMockBookings(firebaseUid) {
  return typeof firebaseUid === "string" && Object.prototype.hasOwnProperty.call(mockBookings, firebaseUid);
}

/**
 * Registers mock bookings for a specific customer UID for unit testing.
 * @param {string} firebaseUid 
 * @param {Array<object>} bookings 
 */
function __setMockBookings(firebaseUid, bookings) {
  if (typeof firebaseUid === "string") {
    const list = Array.isArray(bookings) ? bookings : [];
    mockBookings[firebaseUid] = list;
    list.forEach((b) => {
      if (b && b.id) {
        mockBookingsById[b.id] = { ...b, firebaseUid };
      }
    });
  }
}

/**
 * Registers a single mock booking by ID.
 * @param {string} bookingId 
 * @param {object|null} bookingData 
 */
function __setMockBookingById(bookingId, bookingData) {
  if (typeof bookingId === "string") {
    mockBookingsById[bookingId] = bookingData;
  }
}

/**
 * Clears all mock booking registrations.
 */
function __clearMockBookings() {
  mockBookings = Object.create(null);
  mockBookingsById = Object.create(null);
}

/**
 * Retrieves booking details by booking ID with optional customer-owner constraint.
 * @param {string} bookingId 
 * @param {string|null} [customerId=null] 
 * @returns {Promise<object|null>}
 */
async function getBookingById(bookingId, customerId = null) {
  if (!bookingId) return null;

  if (typeof bookingId === "string" && Object.prototype.hasOwnProperty.call(mockBookingsById, bookingId)) {
    const mockRecord = mockBookingsById[bookingId];
    if (!mockRecord) return null;
    if (customerId && mockRecord.customerId && mockRecord.customerId !== customerId) {
      return null;
    }
    return mockRecord;
  }

  if (!prisma) {
    if (process.env.NODE_ENV === "test") {
      return null;
    }
    throw new Error("Prisma client is not initialized.");
  }

  const includeConfig = {
    service: true,
    professional: {
      include: {
        user: true,
      },
    },
    customer: true,
    address: true,
  };

  let booking;
  if (customerId) {
    booking = await prisma.booking.findFirst({
      where: { id: bookingId, customerId },
      include: includeConfig,
    });
  } else {
    booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: includeConfig,
    });
  }

  if (!booking) return null;

  return {
    id: booking.id,
    customerId: booking.customerId,
    professionalId: booking.professionalId,
    serviceId: booking.serviceId,
    addressId: booking.addressId,
    totalPrice: Number(booking.totalPrice),
    scheduledDate: booking.scheduledDate,
    status: booking.status,
    service: booking.service,
    professional: booking.professional,
    customer: booking.customer,
    address: booking.address,
  };
}

/**
 * Retrieves paginated completed booking history for an authenticated customer.
 * 
 * @param {object} params
 * @param {string} params.firebaseUid - Firebase user UID
 * @param {number} [params.page=1] - Current page number (1-indexed)
 * @param {number} [params.limit=10] - Items per page
 * @returns {Promise<{ bookings: Array<object>, pagination: { page: number, limit: number, total: number, totalPages: number } }>}
 */
async function findCompletedBookingsByCustomer({ firebaseUid, page = 1, limit = 10 }) {
  const rawPage = parseInt(page, 10);
  const rawLimit = parseInt(limit, 10);

  const safePage = Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : 1;
  const safeLimit = Number.isFinite(rawLimit)
    ? Math.min(100, Math.max(1, rawLimit))
    : 10;
  const skip = (safePage - 1) * safeLimit;

  // Check mock registry first (active in test suites)
  if (hasMockBookings(firebaseUid)) {
    const list = mockBookings[firebaseUid] || [];
    const completedList = list.filter((b) => b.status === "COMPLETED");
    const paginated = completedList.slice(skip, skip + safeLimit);

    return {
      bookings: paginated.map(formatBookingItem),
      pagination: {
        page: safePage,
        limit: safeLimit,
        total: completedList.length,
        totalPages: Math.ceil(completedList.length / safeLimit) || (completedList.length === 0 ? 0 : 1),
      },
    };
  }

  if (!prisma) {
    if (process.env.NODE_ENV === "test") {
      return {
        bookings: [],
        pagination: {
          page: safePage,
          limit: safeLimit,
          total: 0,
          totalPages: 0,
        },
      };
    }
    throw new Error("Prisma client is not initialized.");
  }

  // 1. Resolve User ID from Firebase UID
  const user = await prisma.user.findFirst({
    where: { firebaseUid },
    select: { id: true },
  });

  if (!user) {
    return {
      bookings: [],
      pagination: {
        page: safePage,
        limit: safeLimit,
        total: 0,
        totalPages: 0,
      },
    };
  }

  const whereCondition = {
    customerId: user.id,
    status: "COMPLETED",
  };

  // 2. Fetch total count & paginated records in parallel
  const [total, records] = await Promise.all([
    prisma.booking.count({ where: whereCondition }),
    prisma.booking.findMany({
      where: whereCondition,
      include: {
        service: true,
        professional: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        review: true,
      },
      orderBy: {
        scheduledDate: "desc",
      },
      skip,
      take: safeLimit,
    }),
  ]);

  return {
    bookings: records.map(formatBookingItem),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit) || (total === 0 ? 0 : 1),
    },
  };
}

/**
 * Rebook flow: Simultaneously loads Customer Profile, Original Booking, Professional Details,
 * and Calendar Availability using parallelFetch (FR-002, FR-003).
 * 
 * @param {object} params
 * @param {string} params.firebaseUid
 * @param {string} params.originalBookingId
 * @param {string} [params.requestedDate]
 * @returns {Promise<object|null>}
 */
async function initiateRebookFlow({ firebaseUid, originalBookingId, requestedDate }) {
  if (!originalBookingId) return null;

  // Step 1: Parallel fetch of customer profile and original booking
  const { results: initialData, errors: initialErrors, hasErrors: initialHasErrors } = await parallelFetch({
    customer: () => customerService.findByFirebaseUid(firebaseUid),
    originalBooking: () => getBookingById(originalBookingId),
  });

  if (initialHasErrors) {
    const firstError = Object.values(initialErrors)[0];
    throw firstError;
  }

  const customer = initialData.customer;
  const originalBooking = initialData.originalBooking;

  if (!originalBooking || !customer) {
    return null;
  }

  // Security check: verify booking belongs to requesting customer
  if (originalBooking.customerId && customer.id && originalBooking.customerId !== customer.id) {
    return null;
  }

  const targetDate =
    requestedDate && professionalService.isValidDateFormat(requestedDate)
      ? requestedDate
      : new Date().toISOString().split("T")[0];

  const professionalId =
    originalBooking.professionalId ||
    originalBooking.professional?.id ||
    "prof_unknown";

  // Step 2: Parallel fetch of professional details and availability slots
  const { results: profData, errors: profErrors, hasErrors: profHasErrors } = await parallelFetch({
    professional: async () => {
      if (prisma) {
        return prisma.professionalProfile.findUnique({
          where: { id: professionalId },
          include: { user: true },
        });
      }
      return originalBooking.professional || null;
    },
    availability: () =>
      professionalService.getProfessionalAvailability({
        professionalId,
        date: targetDate,
      }),
  });

  if (profHasErrors) {
    const firstError = Object.values(profErrors)[0];
    throw firstError;
  }

  const slots = profData.availability?.slots || [];
  const hasAvailableSlots = slots.some((s) => s.status === "AVAILABLE");

  const serviceName =
    originalBooking.service?.name ||
    originalBooking.serviceName ||
    "Home Service";

  const price = typeof originalBooking.totalPrice !== "undefined"
    ? Number(originalBooking.totalPrice)
    : typeof originalBooking.price !== "undefined"
    ? Number(originalBooking.price)
    : 0;

  const profName =
    profData.professional?.user?.name ||
    profData.professional?.name ||
    originalBooking.professional?.name ||
    originalBooking.professional?.user?.name ||
    "Professional";

  return {
    originalBookingId,
    customer: {
      id: customer.id,
      name: customer.name || "",
      email: customer.email || "",
    },
    service: {
      id: originalBooking.serviceId || originalBooking.service?.id || "service_default",
      name: serviceName,
      price,
    },
    professional: {
      id: professionalId,
      name: profName,
      isAvailable: hasAvailableSlots,
    },
    date: targetDate,
    slots: hasAvailableSlots ? slots : [],
    // Day 6 stub: signal frontend to show alternates when original professional is unavailable
    alternativesAvailable: !hasAvailableSlots,
    alternatives: [], // TODO (Day 6): Implement alternate professional suggestion algorithm
    message: hasAvailableSlots ? undefined : "Original professional is unavailable on this date.",
  };
}

/**
 * Confirms and creates a new rebooked appointment inside a transaction (FR-005).
 * Prevents double-booking using row-level check-then-write pattern.
 * 
 * @param {object} params
 * @param {string} params.firebaseUid
 * @param {string} params.originalBookingId
 * @param {string} params.professionalId
 * @param {object} params.slot - { date, startTime, endTime }
 * @returns {Promise<object>}
 */
async function confirmRebooking({ firebaseUid, originalBookingId, professionalId, slot }) {
  const timeRegex = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

  if (
    !originalBookingId ||
    !professionalId ||
    !slot?.date ||
    !timeRegex.test(slot?.startTime) ||
    !timeRegex.test(slot?.endTime) ||
    !professionalService.isValidDateFormat(slot?.date)
  ) {
    const err = new Error("Missing or invalid parameters for rebooking confirmation.");
    err.code = "INVALID_PARAMETERS";
    throw err;
  }

  // Load customer and original booking in parallel
  const { results, errors, hasErrors } = await parallelFetch({
    customer: () => customerService.findByFirebaseUid(firebaseUid),
    originalBooking: () => getBookingById(originalBookingId),
  });

  if (hasErrors) {
    const firstError = Object.values(errors)[0];
    throw firstError;
  }

  const customer = results.customer;
  const originalBooking = results.originalBooking;

  if (!customer) {
    const err = new Error(`Customer profile not found for user: ${firebaseUid}`);
    err.code = "CUSTOMER_NOT_FOUND";
    throw err;
  }

  if (!originalBooking) {
    const err = new Error(`Original booking '${originalBookingId}' not found.`);
    err.code = "BOOKING_NOT_FOUND";
    throw err;
  }

  // Security check: verify ownership
  if (originalBooking.customerId && customer.id && originalBooking.customerId !== customer.id) {
    const err = new Error(`Original booking '${originalBookingId}' does not belong to this customer.`);
    err.code = "BOOKING_NOT_FOUND";
    throw err;
  }

  // 1. In-Memory Mock Transaction (for isolated unit/CI tests)
  if (process.env.NODE_ENV === "test" && !prisma) {
    const isReserved = professionalService.__reserveMockSlot({
      professionalId,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
    });

    if (!isReserved) {
      const err = new Error("Selected time slot is no longer available.");
      err.code = "SLOT_UNAVAILABLE";
      throw err;
    }

    const newBookingId = `bk_rebook_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newBookingRecord = {
      id: newBookingId,
      parentBookingId: originalBooking.id,
      rebookedFrom: originalBooking.id,
      bookingSource: "REBOOK",
      customerId: customer.id,
      professionalId,
      serviceId: originalBooking.serviceId || "service_default",
      serviceName: originalBooking.service?.name || originalBooking.serviceName || "Home Service",
      professional: {
        id: professionalId,
        name: originalBooking.professional?.name || originalBooking.professional?.user?.name || "Professional",
      },
      slot: {
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
      },
      totalPrice: originalBooking.totalPrice || originalBooking.price || 0,
      status: "CONFIRMED",
      createdAt: new Date().toISOString(),
    };

    __setMockBookingById(newBookingId, newBookingRecord);

    return {
      id: newBookingId,
      parentBookingId: originalBooking.id,
      rebookedFrom: originalBooking.id,
      bookingSource: "REBOOK",
      serviceName: newBookingRecord.serviceName,
      professional: newBookingRecord.professional,
      slot: newBookingRecord.slot,
      status: "CONFIRMED",
    };
  }

  // 2. Prisma Database Transaction ($transaction with atomic conditional updateMany check-then-write)
  if (!prisma) {
    throw new Error("Prisma client is not initialized.");
  }

  const newBooking = await prisma.$transaction(async (tx) => {
    // A. Check slot existence & availability
    const slotRecord = await tx.professionalAvailability.findFirst({
      where: {
        professionalId,
        date: new Date(`${slot.date}T00:00:00.000Z`),
        startTime: new Date(`${slot.date}T${slot.startTime}:00.000Z`),
        endTime: new Date(`${slot.date}T${slot.endTime}:00.000Z`),
      },
    });

    if (!slotRecord || slotRecord.status !== "AVAILABLE") {
      const err = new Error("Selected time slot is no longer available.");
      err.code = "SLOT_UNAVAILABLE";
      throw err;
    }

    // B. Atomically lock and update slot to BOOKED using conditional updateMany
    const updateResult = await tx.professionalAvailability.updateMany({
      where: {
        id: slotRecord.id,
        status: "AVAILABLE",
      },
      data: {
        status: "BOOKED",
        version: { increment: 1 },
      },
    });

    if (updateResult.count === 0) {
      const err = new Error("Selected time slot is no longer available.");
      err.code = "SLOT_UNAVAILABLE";
      throw err;
    }

    // C. Create new Booking referencing original booking as parent
    const created = await tx.booking.create({
      data: {
        customerId: customer.id,
        professionalId,
        serviceId: originalBooking.serviceId,
        addressId: originalBooking.addressId,
        slotId: slotRecord.id,
        status: "CONFIRMED",
        bookingSource: "REBOOK",
        parentBookingId: originalBooking.id,
        totalPrice: originalBooking.totalPrice,
        scheduledDate: new Date(`${slot.date}T00:00:00.000Z`),
        scheduledStartTime: new Date(`${slot.date}T${slot.startTime}:00.000Z`),
        scheduledEndTime: new Date(`${slot.date}T${slot.endTime}:00.000Z`),
      },
      include: {
        service: true,
        professional: {
          include: {
            user: true,
          },
        },
      },
    });

    return created;
  });

  return {
    id: newBooking.id,
    parentBookingId: newBooking.parentBookingId,
    rebookedFrom: newBooking.parentBookingId,
    bookingSource: newBooking.bookingSource,
    serviceName: newBooking.service?.name || "Service",
    professional: {
      id: professionalId,
      name: newBooking.professional?.user?.name || "Professional",
    },
    slot: {
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
    },
    status: "CONFIRMED",
  };
}

/**
 * Normalizes a raw booking record into the API response contract.
 * @param {object} b 
 * @returns {object}
 */
function formatBookingItem(b) {
  const professionalId = b.professional?.id || b.professionalId || "unknown";
  const professionalName =
    b.professional?.name ||
    b.professional?.user?.name ||
    "Professional";

  const bookingDate = b.scheduledDate
    ? new Date(b.scheduledDate).toISOString()
    : b.bookingDate
    ? new Date(b.bookingDate).toISOString()
    : b.createdAt
    ? new Date(b.createdAt).toISOString()
    : new Date().toISOString();

  const price = typeof b.totalPrice !== "undefined"
    ? Number(b.totalPrice)
    : typeof b.price !== "undefined"
    ? Number(b.price)
    : 0;

  const rating =
    b.review?.rating ??
    b.rating ??
    (b.professional?.ratingAvg ? Math.round(b.professional.ratingAvg) : 5);

  return {
    id: b.id,
    serviceName: b.service?.name || b.serviceName || "Home Service",
    professional: {
      id: professionalId,
      name: professionalName,
    },
    bookingDate,
    price,
    rating,
    status: b.status || "COMPLETED",
  };
}

module.exports = {
  getBookingById,
  findCompletedBookingsByCustomer,
  initiateRebookFlow,
  confirmRebooking,
  __setMockBookings,
  __setMockBookingById,
  __clearMockBookings,
  hasMockBookings,
};
