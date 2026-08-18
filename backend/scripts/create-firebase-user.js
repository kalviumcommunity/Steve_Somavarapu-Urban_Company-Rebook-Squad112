require("dotenv").config();
const crypto = require("crypto");
const { getFirebaseAuth } = require("../src/config/firebase");

async function createTestUser() {
  const approvedNonProdEnvs = ["development", "test", "local"];
  const isApprovedEnv = approvedNonProdEnvs.includes(process.env.NODE_ENV);
  const isExplicitOptIn = process.env.ALLOW_TEST_USER_CREATION === "true";

  if (process.env.NODE_ENV === "production" || (!isExplicitOptIn && !isApprovedEnv)) {
    console.error(
      "Refusing to create test user. Execution requires explicit opt-in (ALLOW_TEST_USER_CREATION=true) or an approved non-production NODE_ENV (development, test, local)."
    );
    process.exit(1);
  }

  const auth = getFirebaseAuth();
  if (!auth) {
    console.error("Firebase Admin SDK failed to initialize. Check your .env credentials.");
    process.exit(1);
  }

  const testEmail = `testcustomer_${Date.now()}@example.com`;
  const strongPassword = `${crypto.randomBytes(18).toString("base64")}!Aa1`;

  try {
    const userRecord = await auth.createUser({
      email: testEmail,
      password: strongPassword,
      displayName: "Steve Somavarapu",
    });

    console.log("\n==========================================");
    console.log("SUCCESS! Firebase Test User Created:");
    console.log("==========================================");
    console.log(`User UID     : ${userRecord.uid}`);
    console.log(`Email        : ${userRecord.email}`);
    console.log(`Display Name : ${userRecord.displayName}`);
    console.log("==========================================\n");
  } catch (error) {
    if (error.code === "auth/email-already-exists") {
      console.log("User already exists. Attempting to fetch user...");
      try {
        const existingUser = await auth.getUserByEmail(testEmail);
        console.log(`User UID     : ${existingUser.uid}`);
        console.log(`Email        : ${existingUser.email}`);
      } catch (fetchError) {
        console.error("Failed to fetch existing user:", fetchError.message);
        process.exitCode = 1;
      }
    } else {
      console.error("Failed to create Firebase user:", error.message);
      process.exitCode = 1;
    }
  }
}

createTestUser();
