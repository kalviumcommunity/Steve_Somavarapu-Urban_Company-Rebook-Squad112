process.env.NODE_ENV = "test";
process.env.ENABLE_MOCK_PRISMA = "true";
require("dotenv").config();

const assert = require("assert");
const { generateToken } = require("../src/utils/jwt");
const {
  __setMockProfessional,
  __setMockAvailability,
  __clearMockProfessionals,
} = require("../src/services/professional.service");

const token = generateToken({ id: "firebase_user_test", email: "test@example.com" });
const app = require("../src/app");

async function runProfessionalTests() {
  console.log("--- Starting Day 4 Professional Availability API Tests ---");

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  try {
    // 1. Test: No token provided -> 401 Unauthorized
    {
      const res = await fetch(`${baseUrl}/api/professional/prof_1/availability?date=2026-08-25`);
      const body = await res.json();
      assert.strictEqual(res.status, 401, "Expected 401 without Authorization header");
      assert.strictEqual(body.success, false);
      assert.strictEqual(body.error.code, "UNAUTHORIZED");
      console.log("✓ Pass 1: GET /api/professional/:id/availability without token -> 401");
    }

    // 2. Test: Invalid token provided -> 401 Unauthorized
    {
      const res = await fetch(`${baseUrl}/api/professional/prof_1/availability?date=2026-08-25`, {
        headers: { Authorization: "Bearer bad-token" },
      });
      const body = await res.json();
      assert.strictEqual(res.status, 401, "Expected 401 with invalid token");
      assert.strictEqual(body.success, false);
      assert.strictEqual(body.error.code, "UNAUTHORIZED");
      console.log("✓ Pass 2: GET /api/professional/:id/availability with invalid token -> 401");
    }

    // 3. Test: Missing date query parameter -> 400 Bad Request
    {
      const res = await fetch(`${baseUrl}/api/professional/prof_1/availability`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json();
      assert.strictEqual(res.status, 400, "Expected 400 when date query parameter is missing");
      assert.strictEqual(body.success, false);
      assert.strictEqual(body.error.code, "INVALID_DATE_FORMAT");
      console.log("✓ Pass 3: GET /api/professional/:id/availability missing date -> 400");
    }

    // 4. Test: Malformed date format (e.g. DD-MM-YYYY) -> 400 Bad Request
    {
      const res = await fetch(`${baseUrl}/api/professional/prof_1/availability?date=25-08-2026`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json();
      assert.strictEqual(res.status, 400, "Expected 400 for invalid date format (25-08-2026)");
      assert.strictEqual(body.success, false);
      assert.strictEqual(body.error.code, "INVALID_DATE_FORMAT");
      console.log("✓ Pass 4: GET /api/professional/:id/availability malformed date -> 400");
    }

    // 5. Test: Invalid calendar date (e.g. 2026-02-30) -> 400 Bad Request
    {
      const res = await fetch(`${baseUrl}/api/professional/prof_1/availability?date=2026-02-30`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json();
      assert.strictEqual(res.status, 400, "Expected 400 for non-existent calendar date (2026-02-30)");
      assert.strictEqual(body.success, false);
      assert.strictEqual(body.error.code, "INVALID_DATE_FORMAT");
      console.log("✓ Pass 5: GET /api/professional/:id/availability invalid calendar date -> 400");
    }

    // 6. Test: Non-existent professional -> 404 Professional Not Found
    {
      const res = await fetch(`${baseUrl}/api/professional/non_existent_prof_999/availability?date=2026-08-25`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json();
      assert.strictEqual(res.status, 404, "Expected 404 for unknown professional ID");
      assert.strictEqual(body.success, false);
      assert.strictEqual(body.error.code, "PROFESSIONAL_NOT_FOUND");
      console.log("✓ Pass 6: GET /api/professional/:id/availability non-existent professional -> 404");
    }

    // 7. Test: Valid professional with populated availability -> 200 with PRD slots array
    {
      const targetDate = "2026-08-25";
      const sampleSlots = [
        { startTime: "09:00", endTime: "10:00", status: "AVAILABLE" },
        { startTime: "10:00", endTime: "11:00", status: "BOOKED" },
        { startTime: "11:00", endTime: "12:00", status: "AVAILABLE" },
        { startTime: "14:00", endTime: "15:00", status: "BLOCKED" },
      ];

      __setMockProfessional("prof_1", {
        id: "prof_1",
        userId: "user_prof_1",
        name: "Teja Ram",
        rating: 4.85,
        reviewCount: 124,
      });

      __setMockAvailability("prof_1", targetDate, sampleSlots);

      const res = await fetch(`${baseUrl}/api/professional/prof_1/availability?date=${targetDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json();
      assert.strictEqual(res.status, 200, "Expected 200 with availability data");
      assert.strictEqual(body.success, true);
      assert.strictEqual(body.professionalId, "prof_1");
      assert.strictEqual(body.date, targetDate);
      assert.strictEqual(Array.isArray(body.slots), true);
      assert.strictEqual(body.slots.length, 4);

      // Verify PRD slot schema shape
      const firstSlot = body.slots[0];
      assert.strictEqual(firstSlot.startTime, "09:00");
      assert.strictEqual(firstSlot.endTime, "10:00");
      assert.strictEqual(firstSlot.status, "AVAILABLE");

      console.log("✓ Pass 7: GET /api/professional/:id/availability valid professional & date -> 200 with slots");
    }

    // 8. Test: Valid professional with no explicit slot overrides (default all-day available) -> 200 default slots
    {
      const targetDate = "2026-08-26";
      __setMockProfessional("prof_2", {
        id: "prof_2",
        userId: "user_prof_2",
        name: "Rahul Kumar",
      });

      const res = await fetch(`${baseUrl}/api/professional/prof_2/availability?date=${targetDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json();
      assert.strictEqual(res.status, 200, "Expected 200 for professional with default slots");
      assert.strictEqual(body.success, true);
      assert.strictEqual(body.slots.length, 9, "Expected 9 hourly working slots (9 AM to 6 PM)");
      assert.strictEqual(body.slots.every((s) => s.status === "AVAILABLE"), true, "All default slots must be AVAILABLE");
      console.log("✓ Pass 8: Default slot generation returns 9 standard slots between 09:00 and 18:00");
    }

    console.log("\n✅ ALL PROFESSIONAL AVAILABILITY TESTS PASSED!\n");
  } finally {
    __clearMockProfessionals();
    await new Promise((resolve) => server.close(resolve));
  }
}

runProfessionalTests().catch((err) => {
  console.error("Professional tests failed:", err);
  process.exit(1);
});
