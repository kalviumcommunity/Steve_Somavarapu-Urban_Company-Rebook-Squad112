process.env.NODE_ENV = "test";
process.env.ENABLE_MOCK_PRISMA = "true";
require("dotenv").config();

const assert = require("assert");
const firebaseConfig = require("../src/config/firebase");
const { __setMockBookings, __clearMockBookings } = require("../src/services/booking.service");

// Mock Firebase token verification for test environment
const originalGetFirebaseAuth = firebaseConfig.getFirebaseAuth;

const mockAuth = {
  verifyIdToken: async (token) => {
    if (token === "valid-user-no-bookings") {
      return { uid: "firebase_user_empty", email: "empty@example.com" };
    }
    if (token === "valid-user-with-bookings") {
      return { uid: "firebase_user_with_data", email: "data@example.com" };
    }
    throw new Error("Invalid or expired token");
  },
};
firebaseConfig.getFirebaseAuth = () => mockAuth;

const app = require("../src/app");

async function runBookingTests() {
  console.log("--- Starting Day 3 Booking History API Tests ---");

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  try {
    // 1. Test: No token provided -> 401 Unauthorized
    {
      const res = await fetch(`${baseUrl}/api/bookings/history`);
      const body = await res.json();
      assert.strictEqual(res.status, 401, "Expected 401 without Authorization header");
      assert.strictEqual(body.success, false);
      assert.strictEqual(body.error.code, "UNAUTHORIZED");
      console.log("✓ Pass 1: GET /api/bookings/history without token -> 401");
    }

    // 2. Test: Invalid token provided -> 401 Unauthorized
    {
      const res = await fetch(`${baseUrl}/api/bookings/history`, {
        headers: { Authorization: "Bearer bad-expired-token" },
      });
      const body = await res.json();
      assert.strictEqual(res.status, 401, "Expected 401 with invalid token");
      assert.strictEqual(body.success, false);
      assert.strictEqual(body.error.code, "UNAUTHORIZED");
      console.log("✓ Pass 2: GET /api/bookings/history with invalid token -> 401");
    }

    // 3. Test: Valid token, no completed bookings -> 200 with empty array
    {
      __setMockBookings("firebase_user_empty", []);
      const res = await fetch(`${baseUrl}/api/bookings/history`, {
        headers: { Authorization: "Bearer valid-user-no-bookings" },
      });
      const body = await res.json();
      assert.strictEqual(res.status, 200, "Expected 200 for user with no bookings");
      assert.strictEqual(body.success, true);
      assert.strictEqual(Array.isArray(body.bookings), true);
      assert.strictEqual(body.bookings.length, 0);
      assert.strictEqual(body.pagination.total, 0);
      assert.strictEqual(body.pagination.page, 1);
      assert.strictEqual(body.pagination.limit, 10);
      console.log("✓ Pass 3: GET /api/bookings/history with valid token, no bookings -> 200 []");
    }

    // 4. Test: Valid token, completed bookings exist -> 200 with formatted list matching PRD shape
    {
      const sampleBookings = [
        {
          id: "bk_comp_1",
          serviceName: "Deep Home Cleaning",
          professional: { id: "prof_1", name: "Teja Ram" },
          scheduledDate: "2026-08-01T10:00:00.000Z",
          totalPrice: 1299.00,
          rating: 5,
          status: "COMPLETED",
        },
        {
          id: "bk_comp_2",
          serviceName: "AC Master Servicing",
          professional: { id: "prof_2", name: "Rahul Kumar" },
          scheduledDate: "2026-07-15T14:30:00.000Z",
          totalPrice: 699.00,
          rating: 4,
          status: "COMPLETED",
        },
        {
          id: "bk_comp_3",
          serviceName: "Sofa Spa & Shampoo",
          professional: { id: "prof_3", name: "Anita Sharma" },
          scheduledDate: "2026-06-20T11:00:00.000Z",
          totalPrice: 899.00,
          rating: 5,
          status: "COMPLETED",
        },
        {
          id: "bk_pending_4",
          serviceName: "Bathroom Cleaning",
          professional: { id: "prof_4", name: "Vikram" },
          scheduledDate: "2026-08-25T16:00:00.000Z",
          totalPrice: 499.00,
          rating: 5,
          status: "PENDING", // Should be filtered out from history
        },
      ];

      __setMockBookings("firebase_user_with_data", sampleBookings);

      const res = await fetch(`${baseUrl}/api/bookings/history`, {
        headers: { Authorization: "Bearer valid-user-with-bookings" },
      });
      const body = await res.json();
      assert.strictEqual(res.status, 200);
      assert.strictEqual(body.success, true);
      assert.strictEqual(body.bookings.length, 3, "Only COMPLETED bookings should be returned");

      // Verify exact JSON contract shape from PRD
      const first = body.bookings[0];
      assert.strictEqual(typeof first.id, "string");
      assert.strictEqual(typeof first.serviceName, "string");
      assert.strictEqual(typeof first.professional, "object");
      assert.strictEqual(typeof first.professional.id, "string");
      assert.strictEqual(typeof first.professional.name, "string");
      assert.strictEqual(typeof first.bookingDate, "string");
      assert.strictEqual(typeof first.price, "number");
      assert.strictEqual(typeof first.rating, "number");
      assert.strictEqual(first.status, "COMPLETED");

      assert.strictEqual(body.pagination.total, 3);
      assert.strictEqual(body.pagination.page, 1);
      assert.strictEqual(body.pagination.limit, 10);
      assert.strictEqual(body.pagination.totalPages, 1);
      console.log("✓ Pass 4: GET /api/bookings/history returns completed bookings with exact PRD shape");
    }

    // 5. Test: Pagination parameters respected (?page=2&limit=1)
    {
      const res = await fetch(`${baseUrl}/api/bookings/history?page=2&limit=1`, {
        headers: { Authorization: "Bearer valid-user-with-bookings" },
      });
      const body = await res.json();
      assert.strictEqual(res.status, 200);
      assert.strictEqual(body.success, true);
      assert.strictEqual(body.bookings.length, 1);
      assert.strictEqual(body.bookings[0].id, "bk_comp_2");
      assert.strictEqual(body.pagination.page, 2);
      assert.strictEqual(body.pagination.limit, 1);
      assert.strictEqual(body.pagination.total, 3);
      assert.strictEqual(body.pagination.totalPages, 3);
      console.log("✓ Pass 5: Pagination query params (?page=2&limit=1) correctly handled");
    }

    console.log("\n✅ ALL BOOKING HISTORY API TESTS PASSED!\n");
  } finally {
    __clearMockBookings();
    firebaseConfig.getFirebaseAuth = originalGetFirebaseAuth;
    await new Promise((resolve) => server.close(resolve));
  }
}

runBookingTests().catch((err) => {
  console.error("Booking tests failed:", err);
  process.exit(1);
});
