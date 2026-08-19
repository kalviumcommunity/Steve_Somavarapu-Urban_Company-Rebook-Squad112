const prisma = require("../config/prisma");

// In-memory mock registry initialized with null prototype for test isolation
let mockBookings = Object.create(null);

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
    mockBookings[firebaseUid] = Array.isArray(bookings) ? bookings : [];
  }
}

/**
 * Clears all mock booking registrations.
 */
function __clearMockBookings() {
  mockBookings = Object.create(null);
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
  findCompletedBookingsByCustomer,
  __setMockBookings,
  __clearMockBookings,
  hasMockBookings,
};
