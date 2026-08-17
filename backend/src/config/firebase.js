const { initializeApp, getApps, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

let authInstance = null;

function cleanEnvVal(val) {
  if (!val) return "";
  let cleaned = val.trim();
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1);
  }
  return cleaned.trim();
}

function initializeFirebase() {
  if (getApps().length > 0) {
    authInstance = getAuth();
    return authInstance;
  }

  const projectId = cleanEnvVal(process.env.FIREBASE_PROJECT_ID);
  const clientEmail = cleanEnvVal(process.env.FIREBASE_CLIENT_EMAIL);
  let rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY || "";

  if (
    !projectId ||
    !clientEmail ||
    !rawPrivateKey ||
    rawPrivateKey.includes("YOUR_PRIVATE_KEY_HERE")
  ) {
    console.warn(
      "[Firebase Admin SDK] Credentials incomplete in environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)."
    );
    return null;
  }

  // Safely format multiline private key from .env string
  let privateKey = rawPrivateKey.trim();
  if (
    (privateKey.startsWith('"') && privateKey.endsWith('"')) ||
    (privateKey.startsWith("'") && privateKey.endsWith("'"))
  ) {
    privateKey = privateKey.slice(1, -1);
  }
  privateKey = privateKey.replace(/\\n/g, "\n");

  try {
    const app = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    console.log("[Firebase Admin SDK] Initialized successfully.");
    authInstance = getAuth(app);
    return authInstance;
  } catch (error) {
    console.error("[Firebase Admin SDK] Initialization failed:", error.message);
    return null;
  }
}

function getFirebaseAuth() {
  if (!authInstance) {
    if (getApps().length > 0) {
      authInstance = getAuth();
    } else {
      authInstance = initializeFirebase();
    }
  }
  return authInstance;
}

module.exports = {
  initializeFirebase,
  getFirebaseAuth,
};
