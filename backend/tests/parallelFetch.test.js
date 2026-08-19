const assert = require("assert");
const { parallelFetch } = require("../src/utils/parallelFetch");

async function runParallelFetchTests() {
  console.log("--- Starting Parallel Fetch Utility Tests ---");

  // Test 1: Empty or invalid input
  {
    const resEmpty = await parallelFetch();
    assert.deepStrictEqual(resEmpty, { results: {}, errors: {}, hasErrors: false });

    const resNull = await parallelFetch(null);
    assert.deepStrictEqual(resNull, { results: {}, errors: {}, hasErrors: false });
    console.log("✓ Pass 1: Empty and null inputs handled gracefully");
  }

  // Test 2: Concurrent successful async functions of different latencies
  {
    const fetchers = {
      profile: async () => {
        await new Promise((r) => setTimeout(r, 20));
        return { name: "Steve", role: "CUSTOMER" };
      },
      booking: async () => {
        await new Promise((r) => setTimeout(r, 10));
        return { id: "bk_123", serviceName: "Car Cleaning" };
      },
      availability: async () => {
        return { slotsAvailable: 4 };
      },
    };

    const { results, errors, hasErrors } = await parallelFetch(fetchers);

    assert.strictEqual(hasErrors, false);
    assert.deepStrictEqual(errors, {});
    assert.strictEqual(results.profile.name, "Steve");
    assert.strictEqual(results.booking.id, "bk_123");
    assert.strictEqual(results.availability.slotsAvailable, 4);
    console.log("✓ Pass 2: Multiple concurrent fetchers resolved in parallel");
  }

  // Test 3: Partial failure scenario (one throws, others succeed)
  {
    const simulatedError = new Error("Calendar service timeout");
    const fetchers = {
      customerProfile: async () => {
        await new Promise((r) => setTimeout(r, 30)); // Slow async
        return { id: "cust_1", name: "Rishit" };
      },
      failingService: async () => {
        throw simulatedError; // Failing async
      },
      syncFailingService: () => {
        throw new Error("Immediate synchronous failure");
      },
      serviceDetails: async () => {
        return { serviceId: "srv_99", name: "Deep AC Service" };
      },
    };

    const { results, errors, hasErrors } = await parallelFetch(fetchers);

    // Verify error isolation
    assert.strictEqual(hasErrors, true, "Expected hasErrors to be true");
    assert.strictEqual(results.customerProfile.name, "Rishit", "customerProfile should resolve");
    assert.strictEqual(results.serviceDetails.name, "Deep AC Service", "serviceDetails should resolve");
    assert.strictEqual(results.failingService, undefined, "failingService should not be in results");
    assert.strictEqual(results.syncFailingService, undefined, "syncFailingService should not be in results");

    assert.strictEqual(errors.failingService, simulatedError, "failingService error captured");
    assert.strictEqual(errors.syncFailingService.message, "Immediate synchronous failure");
    console.log("✓ Pass 3: Partial failure does not crash the batch and isolates errors correctly");
  }

  console.log("\n✅ ALL PARALLEL FETCH TESTS PASSED!\n");
}

runParallelFetchTests().catch((err) => {
  console.error("Parallel fetch test failed:", err);
  process.exit(1);
});
