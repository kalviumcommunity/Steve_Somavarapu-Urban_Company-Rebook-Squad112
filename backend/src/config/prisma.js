/**
 * Prisma Client Singleton Configuration
 * 
 * Safe against hot-reload duplicate instantiation in development environments.
 * 
 * Expected Customer / User Model Shape (DB Teammate Handoff Specification):
 * =========================================================================
 * model User {
 *   id            String    @id @default(cuid())
 *   firebaseUid   String    @unique // REQUIRED FOR FIREBASE AUTH LOOKUP
 *   name          String?
 *   email         String?   @unique
 *   phone         String?   @unique
 *   role          Role      @default(CUSTOMER)
 *   createdAt     DateTime  @default(now())
 *   updatedAt     DateTime  @updatedAt
 *   addresses     Address[]
 * }
 * =========================================================================
 */

const isMockTestEnv =
  process.env.NODE_ENV === "test" &&
  (process.env.ENABLE_MOCK_PRISMA === "true" || process.env.MOCK_PRISMA === "true");

let PrismaClient;
try {
  const prismaPkg = require("@prisma/client");
  PrismaClient = prismaPkg.PrismaClient;
} catch (err) {
  if (isMockTestEnv) {
    PrismaClient = null;
  } else {
    throw err;
  }
}

let prisma = null;

if (PrismaClient && !isMockTestEnv) {
  try {
    if (process.env.NODE_ENV === "production") {
      prisma = new PrismaClient();
    } else {
      if (!global.__prisma) {
        global.__prisma = new PrismaClient();
      }
      prisma = global.__prisma;
    }
  } catch (err) {
    if (isMockTestEnv) {
      prisma = null;
    } else {
      throw err;
    }
  }
}

module.exports = prisma;
