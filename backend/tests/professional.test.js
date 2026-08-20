process.env.NODE_ENV = "test";
process.env.ENABLE_MOCK_PRISMA = "true";
require("dotenv").config();

const assert = require("assert");
const firebaseConfig = require("../src/config/firebase");
const {
  __setMockProfessional,
  __setMockAvailability,
  __clearMockProfessionals,
} = require("../src/services/professional.service");

// Mock Firebase token verification for test environment
const originalGetFirebaseAuth = firebaseConfig.getFirebaseAuth;

const mockAuth = {
  verifyIdToken: async (token) => {
    if (token === "valid-test-token") {
      return { uid: "firebase_user_test", email: "test@example.com" };
    }
    throw new Error("Invalid or expired token");
  },
};
firebaseConfig.getFirebaseAuth = () => mockAuth;

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
        headers: { Authorization: "Bearer valid-test-token" },
      });
      const body = await res.json();
      assert.strictEqual(res.status, 400, "Expected 400 when date parameter is missing");
      assert.strictEqual(body.success, false);
      assert.strictEqual(body.error.code, "INVALID_DATE_FORMAT");
      console.log("✓ Pass 3: GET /api/professional/:id/availability without date -> 400");
    }

    // 4. Test: Malformed date query parameters -> 400 Bad Request
    {
      const malformedDates = ["invalid-date", "2026/08/25", "25-08-2026", "2026-02-30", "2026-13-01"];
      for (const badDate of malformedDates) {
        const res = await fetch(`${baseUrl}/api/professional/prof_1/availability?date=${badDate}`, {
          headers: { Authorization: "Bearer valid-test-token" },
        });
        const body = await res.json();
        assert.strictEqual(res.status, 400, `Expected 400 for malformed date '${badDate}'`);
        assert.strictEqual(body.success, false);
        assert.strictEqual(body.error.code, "INVALID_DATE_FORMAT");
      }
      console.log("✓ Pass 4: GET /api/professional/:id/availability with malformed date -> 400");
    }

    // 5. Test: Non-existent professional ID -> 404 Not Found
    {
      __setMockProfessional("non-existent-prof", null);
      const res = await fetch(`${baseUrl}/api/professional/non-existent-prof/availability?date=2026-08-25`, {
        headers: { Authorization: "Bearer valid-test-token" },
      });
      const body = await res.json();
      assert.strictEqual(res.status, 404, "Expected 404 for non-existent professional");
      assert.strictEqual(body.success, false);
      assert.strictEqual(body.error.code, "PROFESSIONAL_NOT_FOUND");
      console.log("✓ Pass 5: GET /api/professional/:id/availability with non-existent ID -> 404");
    }

    // 6. Test: Valid request with mock slots (AVAILABLE, BOOKED, BLOCKED) -> 200 OK
    {
      const profId = "prof_teja_123";
      const targetDate = "2026-08-25";

      __setMockProfessional(profId, {
        id: profId,
        name: "Teja Ram",
        categoryId: "cat_cleaning",
      });

      const mockSlots = [
        { startTime: "09:00", endTime: "10:00", status: "AVAILABLE" },
        { startTime: "10:30", endTime: "11:30", status: "BOOKED" },
        { startTime: "12:00", endTime: "13:00", status: "BLOCKED" },
        { startTime: "14:00", endTime: "15:00", status: "AVAILABLE" },
      ];

      __setMockAvailability(profId, targetDate, mockSlots);

      const res = await fetch(`${baseUrl}/api/professional/${profId}/availability?date=${targetDate}`, {
        headers: { Authorization: "Bearer valid-test-token" },
      });
      const body = await res.json();

      assert.strictEqual(res.status, 200, "Expected 200 for valid professional and date");
      assert.strictEqual(body.success, true);
      assert.strictEqual(body.professionalId, profId);
      assert.strictEqual(body.date, targetDate);
      assert.strictEqual(Array.isArray(body.slots), true);
      assert.strictEqual(body.slots.length, 4);

      // Verify exact JSON contract shape from PRD
      assert.deepStrictEqual(body.slots[0], {
        startTime: "09:00",
        endTime: "10:00",
        status: "AVAILABLE",
      });
      assert.deepStrictEqual(body.slots[1], {
        startTime: "10:30",
        endTime: "11:30",
        status: "BOOKED",
      });
      assert.deepStrictEqual(body.slots[2], {
        startTime: "12:00",
        endTime: "13:00",
        status: "BLOCKED",
      });
      assert.deepStrictEqual(body.slots[3], {
        startTime: "14:00",
        endTime: "15:00",
        status: "AVAILABLE",
      });
      console.log("✓ Pass 6: GET /api/professional/:id/availability returns 200 with correctly tagged slots");

      // Verify plural alias /api/professionals/:id/availability
      const resPlural = await fetch(`${baseUrl}/api/professionals/${profId}/availability?date=${targetDate}`, {
        headers: { Authorization: "Bearer valid-test-token" },
      });
      assert.strictEqual(resPlural.status, 200);
      console.log("✓ Pass 7: Plural alias /api/professionals/:id/availability also responds with 200");
    }

    console.log("\n✅ ALL PROFESSIONAL AVAILABILITY API TESTS PASSED!\n");
  } finally {
    __clearMockProfessionals();
    firebaseConfig.getFirebaseAuth = originalGetFirebaseAuth;
    await new Promise((resolve) => server.close(resolve));
  }
}

runProfessionalTests().catch((err) => {
  console.error("Professional tests failed:", err);
  process.exit(1);
});
