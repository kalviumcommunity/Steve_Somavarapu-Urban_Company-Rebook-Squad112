process.env.NODE_ENV = "test";
process.env.ENABLE_MOCK_PRISMA = "true";
require("dotenv").config();

const assert = require("assert");
const firebaseConfig = require("../src/config/firebase");
const {
  __setMockBookings,
  __setMockBookingById,
  __clearMockBookings,
} = require("../src/services/booking.service");
const {
  __setMockCustomer,
  __clearMockCustomers,
} = require("../src/services/customer.service");
const {
  __setMockProfessional,
  __setMockAvailability,
  __clearMockProfessionals,
} = require("../src/services/professional.service");

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
    if (token === "valid-user-other") {
      return { uid: "firebase_user_other", email: "other@example.com" };
    }
    throw new Error("Invalid or expired token");
  },
};
firebaseConfig.getFirebaseAuth = () => mockAuth;

const app = require("../src/app");

async function runBookingTests() {
  console.log("--- Starting Day 3 & Day 5 Booking API Tests ---");

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  try {
    // ----------------------------------------------------
    // 1. History Tests (Day 3)
    // ----------------------------------------------------
    {
      // 1.1: No token provided -> 401 Unauthorized
      const res401 = await fetch(`${baseUrl}/api/bookings/history`);
      const body401 = await res401.json();
      assert.strictEqual(res401.status, 401, "Expected 401 without Authorization header");
      assert.strictEqual(body401.success, false);
      assert.strictEqual(body401.error.code, "UNAUTHORIZED");
      console.log("✓ Pass 1: GET /api/bookings/history without token -> 401");

      // 1.2: Invalid token provided -> 401 Unauthorized
      const resBadToken = await fetch(`${baseUrl}/api/bookings/history`, {
        headers: { Authorization: "Bearer bad-expired-token" },
      });
      const bodyBadToken = await resBadToken.json();
      assert.strictEqual(resBadToken.status, 401, "Expected 401 with invalid token");
      assert.strictEqual(bodyBadToken.success, false);
      assert.strictEqual(bodyBadToken.error.code, "UNAUTHORIZED");
      console.log("✓ Pass 2: GET /api/bookings/history with invalid token -> 401");

      // 1.3: Valid token, no completed bookings -> 200 with empty array
      __setMockBookings("firebase_user_empty", []);
      const resEmpty = await fetch(`${baseUrl}/api/bookings/history`, {
        headers: { Authorization: "Bearer valid-user-no-bookings" },
      });
      const bodyEmpty = await resEmpty.json();
      assert.strictEqual(resEmpty.status, 200, "Expected 200 for user with no bookings");
      assert.strictEqual(bodyEmpty.success, true);
      assert.strictEqual(Array.isArray(bodyEmpty.bookings), true);
      assert.strictEqual(bodyEmpty.bookings.length, 0);
      assert.strictEqual(bodyEmpty.pagination.total, 0);
      console.log("✓ Pass 3: GET /api/bookings/history with valid token, no bookings -> 200 []");

      // 1.4: Valid token, completed bookings exist -> 200 with formatted list
      const sampleBookings = [
        {
          id: "bk_comp_1",
          customerId: "cust_cuid_123",
          serviceName: "Deep Home Cleaning",
          professional: { id: "prof_1", name: "Teja Ram" },
          professionalId: "prof_1",
          scheduledDate: "2026-08-01T10:00:00.000Z",
          totalPrice: 1299.00,
          rating: 5,
          status: "COMPLETED",
        },
        {
          id: "bk_comp_2",
          customerId: "cust_cuid_123",
          serviceName: "AC Master Servicing",
          professional: { id: "prof_2", name: "Rahul Kumar" },
          professionalId: "prof_2",
          scheduledDate: "2026-07-15T14:30:00.000Z",
          totalPrice: 699.00,
          rating: 4,
          status: "COMPLETED",
        },
        {
          id: "bk_pending_4",
          customerId: "cust_cuid_123",
          serviceName: "Bathroom Cleaning",
          professional: { id: "prof_4", name: "Vikram" },
          scheduledDate: "2026-08-25T16:00:00.000Z",
          totalPrice: 499.00,
          rating: 5,
          status: "PENDING", // Should be filtered out from history
        },
      ];

      __setMockBookings("firebase_user_with_data", sampleBookings);

      const resHistory = await fetch(`${baseUrl}/api/bookings/history`, {
        headers: { Authorization: "Bearer valid-user-with-bookings" },
      });
      const bodyHistory = await resHistory.json();
      assert.strictEqual(resHistory.status, 200);
      assert.strictEqual(bodyHistory.success, true);
      assert.strictEqual(bodyHistory.bookings.length, 2, "Only COMPLETED bookings returned");
      console.log("✓ Pass 4: GET /api/bookings/history returns completed bookings with exact PRD shape");
    }

    // ----------------------------------------------------
    // 2. One-Click Rebook Tests (Day 5 - POST /api/bookings/rebook)
    // ----------------------------------------------------
    {
      __setMockCustomer("firebase_user_with_data", {
        id: "cust_cuid_123",
        firebaseUid: "firebase_user_with_data",
        name: "Steve Somavarapu",
        email: "data@example.com",
      });

      // 2.1: Rebook with invalid originalBookingId -> 404
      const resRebook404 = await fetch(`${baseUrl}/api/bookings/rebook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer valid-user-with-bookings",
        },
        body: JSON.stringify({ originalBookingId: "non_existent_bk" }),
      });
      const bodyRebook404 = await resRebook404.json();
      assert.strictEqual(resRebook404.status, 404);
      assert.strictEqual(bodyRebook404.success, false);
      assert.strictEqual(bodyRebook404.error.code, "BOOKING_NOT_FOUND");
      console.log("✓ Pass 5: POST /api/bookings/rebook with invalid booking ID -> 404");

      // 2.2: Cross-customer ownership test: user B requesting user A's booking -> 404
      __setMockCustomer("firebase_user_other", {
        id: "cust_other_456",
        firebaseUid: "firebase_user_other",
        name: "Other User",
        email: "other@example.com",
      });

      const resRebookCross = await fetch(`${baseUrl}/api/bookings/rebook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer valid-user-other",
        },
        body: JSON.stringify({ originalBookingId: "bk_comp_1" }),
      });
      const bodyRebookCross = await resRebookCross.json();
      assert.strictEqual(resRebookCross.status, 404, "Expected 404 when accessing another customer's booking");
      assert.strictEqual(bodyRebookCross.error.code, "BOOKING_NOT_FOUND");
      console.log("✓ Pass 6: POST /api/bookings/rebook rejects cross-customer booking access with 404");

      // 2.3: Rebook with unavailable professional -> alternativesAvailable: true
      const targetDate = "2026-08-25";
      __setMockProfessional("prof_1", { id: "prof_1", name: "Teja Ram" });
      __setMockAvailability("prof_1", targetDate, [
        { startTime: "09:00", endTime: "10:00", status: "BOOKED" },
        { startTime: "11:00", endTime: "12:00", status: "BLOCKED" },
      ]);

      const resRebookUnavail = await fetch(`${baseUrl}/api/bookings/rebook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer valid-user-with-bookings",
        },
        body: JSON.stringify({ originalBookingId: "bk_comp_1", date: targetDate }),
      });
      const bodyRebookUnavail = await resRebookUnavail.json();
      assert.strictEqual(resRebookUnavail.status, 200);
      assert.strictEqual(bodyRebookUnavail.success, true);
      assert.strictEqual(bodyRebookUnavail.professional.isAvailable, false);
      assert.strictEqual(bodyRebookUnavail.alternativesAvailable, true);
      assert.deepStrictEqual(bodyRebookUnavail.alternatives, []);
      console.log("✓ Pass 7: POST /api/bookings/rebook with unavailable professional signals alternativesAvailable: true");

      // 2.4: Rebook with available professional -> returns open slots
      __setMockAvailability("prof_1", targetDate, [
        { startTime: "09:00", endTime: "10:00", status: "AVAILABLE" },
        { startTime: "11:00", endTime: "12:00", status: "BOOKED" },
      ]);

      const resRebookAvail = await fetch(`${baseUrl}/api/bookings/rebook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer valid-user-with-bookings",
        },
        body: JSON.stringify({ originalBookingId: "bk_comp_1", date: targetDate }),
      });
      const bodyRebookAvail = await resRebookAvail.json();
      assert.strictEqual(resRebookAvail.status, 200);
      assert.strictEqual(bodyRebookAvail.success, true);
      assert.strictEqual(bodyRebookAvail.professional.isAvailable, true);
      assert.strictEqual(bodyRebookAvail.alternativesAvailable, false);
      assert.strictEqual(bodyRebookAvail.slots.length, 2);
      assert.strictEqual(bodyRebookAvail.slots[0].status, "AVAILABLE");
      console.log("✓ Pass 8: POST /api/bookings/rebook with available professional returns selectable slots");
    }

    // ----------------------------------------------------
    // 3. Slot Confirmation & Double-Booking Prevention (Day 5 - POST /api/bookings/confirm)
    // ----------------------------------------------------
    {
      const targetDate = "2026-08-25";
      const slotToBook = {
        date: targetDate,
        startTime: "09:00",
        endTime: "10:00",
      };

      // Reset slot to AVAILABLE
      __setMockAvailability("prof_1", targetDate, [
        { startTime: "09:00", endTime: "10:00", status: "AVAILABLE" },
      ]);

      // 3.1: Confirm booking with valid open slot -> 200 & created booking
      const resConfirm1 = await fetch(`${baseUrl}/api/bookings/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer valid-user-with-bookings",
        },
        body: JSON.stringify({
          originalBookingId: "bk_comp_1",
          professionalId: "prof_1",
          slot: slotToBook,
        }),
      });

      const bodyConfirm1 = await resConfirm1.json();
      assert.strictEqual(resConfirm1.status, 200, "Expected 200 for first confirmation");
      assert.strictEqual(bodyConfirm1.success, true);
      assert.strictEqual(typeof bodyConfirm1.booking.id, "string");
      assert.strictEqual(bodyConfirm1.booking.parentBookingId, "bk_comp_1");
      assert.strictEqual(bodyConfirm1.booking.rebookedFrom, "bk_comp_1");
      assert.strictEqual(bodyConfirm1.booking.bookingSource, "REBOOK");
      assert.strictEqual(bodyConfirm1.booking.status, "CONFIRMED");
      console.log("✓ Pass 9: POST /api/bookings/confirm succeeds and links parentBookingId");

      // 3.2: Concurrent simulation: second attempt on same slot -> 409 Conflict
      const resConfirm2 = await fetch(`${baseUrl}/api/bookings/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer valid-user-with-bookings",
        },
        body: JSON.stringify({
          originalBookingId: "bk_comp_1",
          professionalId: "prof_1",
          slot: slotToBook,
        }),
      });

      const bodyConfirm2 = await resConfirm2.json();
      assert.strictEqual(resConfirm2.status, 409, "Expected 409 for duplicate/concurrent booking on same slot");
      assert.strictEqual(bodyConfirm2.success, false);
      assert.strictEqual(bodyConfirm2.error.code, "SLOT_UNAVAILABLE");
      console.log("✓ Pass 10: POST /api/bookings/confirm prevents double-booking and returns 409 SLOT_UNAVAILABLE");

      // 3.3: Confirm with invalid time format -> 400 Bad Request
      const resConfirmBadTime = await fetch(`${baseUrl}/api/bookings/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer valid-user-with-bookings",
        },
        body: JSON.stringify({
          originalBookingId: "bk_comp_1",
          professionalId: "prof_1",
          slot: {
            date: targetDate,
            startTime: "9:00 AM", // Invalid format (not HH:mm)
            endTime: "10:00",
          },
        }),
      });

      const bodyConfirmBadTime = await resConfirmBadTime.json();
      assert.strictEqual(resConfirmBadTime.status, 400);
      assert.strictEqual(bodyConfirmBadTime.error.code, "INVALID_PARAMETERS");
      console.log("✓ Pass 11: POST /api/bookings/confirm rejects invalid time formats with 400");

      // 3.4: Confirm with slot missing/deleted mid-flow -> 409 error cleanly handled
      const resConfirmMissingSlot = await fetch(`${baseUrl}/api/bookings/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer valid-user-with-bookings",
        },
        body: JSON.stringify({
          originalBookingId: "bk_comp_1",
          professionalId: "prof_1",
          slot: {
            date: targetDate,
            startTime: "16:00",
            endTime: "17:00",
          },
        }),
      });

      const bodyConfirmMissing = await resConfirmMissingSlot.json();
      assert.strictEqual(resConfirmMissingSlot.status, 409);
      assert.strictEqual(bodyConfirmMissing.error.code, "SLOT_UNAVAILABLE");
      console.log("✓ Pass 12: POST /api/bookings/confirm cleanly rejects missing slot without partial creation");
    }

    console.log("\n✅ ALL BOOKING, REBOOK & CONFIRMATION TESTS PASSED!\n");
  } finally {
    __clearMockBookings();
    __clearMockCustomers();
    __clearMockProfessionals();
    firebaseConfig.getFirebaseAuth = originalGetFirebaseAuth;
    await new Promise((resolve) => server.close(resolve));
  }
}

runBookingTests().catch((err) => {
  console.error("Booking tests failed:", err);
  process.exit(1);
});
