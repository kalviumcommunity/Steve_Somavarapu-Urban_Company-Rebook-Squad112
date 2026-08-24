process.env.NODE_ENV = "test";
process.env.ENABLE_MOCK_PRISMA = "true";
require("dotenv").config();

const { generateToken } = require("../src/utils/jwt");
const { __setMockCustomer, __clearMockCustomers } = require("../src/services/customer.service");
const assert = require("assert");
const app = require("../src/app");

async function runTests() {
  console.log("--- Starting Day 2 Customer Profile API Tests ---");

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  const token404 = generateToken({ id: "non-existent-user-123", email: "test404@example.com" });
  const token200 = generateToken({ id: "matching-user-456", email: "test200@example.com" });
  const tokenToString = generateToken({ id: "toString", email: "tostring@example.com" });
  const tokenValueOf = generateToken({ id: "valueOf", email: "valueof@example.com" });
  const tokenProto = generateToken({ id: "__proto__", email: "proto@example.com" });

  try {
    // Test Case 1: GET /api/customer/profile without token -> 401
    {
      const res = await fetch(`${baseUrl}/api/customer/profile`);
      const body = await res.json();
      assert.strictEqual(res.status, 401, "Expected 401 without token");
      assert.strictEqual(body.success, false);
      assert.strictEqual(body.error.code, "UNAUTHORIZED");
      console.log("✓ Pass 1: GET /api/customer/profile without token -> 401");
    }

    // Test Case 2: GET /api/customer/profile with valid token, no matching customer row -> 404
    {
      __setMockCustomer("non-existent-user-123", null);
      const res404 = await fetch(`${baseUrl}/api/customer/profile`, {
        headers: { Authorization: `Bearer ${token404}` },
      });
      const body404 = await res404.json();
      assert.strictEqual(res404.status, 404, "Expected 404 when customer profile missing in DB");
      assert.strictEqual(body404.success, false);
      assert.strictEqual(body404.error.code, "CUSTOMER_NOT_FOUND");
      console.log("✓ Pass 2: GET /api/customer/profile with valid token & missing DB row -> 404");

      // Test Case 3: Verify null prototype own-property registry safety for "toString", "valueOf", "__proto__"
      const prototypeKeys = [
        { uid: "toString", token: tokenToString },
        { uid: "valueOf", token: tokenValueOf },
        { uid: "__proto__", token: tokenProto },
      ];

      for (const { uid, token } of prototypeKeys) {
        __setMockCustomer(uid, null);
        const resProto = await fetch(`${baseUrl}/api/customer/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const bodyProto = await resProto.json();
        assert.strictEqual(resProto.status, 404, `Expected 404 for UID '${uid}'`);
        assert.strictEqual(bodyProto.error.code, "CUSTOMER_NOT_FOUND");
      }
      console.log("✓ Pass 3: Null prototype own-property registry safely handles prototype property names");

      // Test Case 4: GET /api/customer/profile with valid token & matching row -> 200
      __setMockCustomer("matching-user-456", {
        id: "cust_cuid_123",
        firebaseUid: "matching-user-456",
        name: "Steve Somavarapu",
        email: "steve@example.com",
        phone: "+1234567890",
        addresses: [
          {
            id: "addr_1",
            street: "123 Main St",
            city: "San Francisco",
            state: "CA",
            postalCode: "94105",
            isDefault: true,
          },
        ],
      });

      const res200 = await fetch(`${baseUrl}/api/customer/profile`, {
        headers: { Authorization: `Bearer ${token200}` },
      });
      const body200 = await res200.json();
      assert.strictEqual(res200.status, 200, "Expected 200 with profile data");
      assert.strictEqual(body200.success, true);
      assert.strictEqual(body200.customer.id, "cust_cuid_123");
      assert.strictEqual(body200.customer.name, "Steve Somavarapu");
      assert.strictEqual(body200.customer.email, "steve@example.com");
      assert.strictEqual(body200.customer.phone, "+1234567890");
      assert.strictEqual(body200.customer.addresses.length, 1);
      console.log("✓ Pass 4: GET /api/customer/profile with valid token & matching DB row -> 200 Profile");

      __clearMockCustomers();
    }

    console.log("\n✅ ALL TEST CASES PASSED SUCCESSFULLY!");
  } finally {
    __clearMockCustomers();
    await new Promise((resolve) => server.close(resolve));
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
