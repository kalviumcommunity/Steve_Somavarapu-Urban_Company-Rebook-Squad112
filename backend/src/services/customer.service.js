const prisma = require("../config/prisma");

// In-memory mock registry initialized with null prototype
let mockCustomers = Object.create(null);

/**
 * Checks if a mock customer is explicitly registered for a given user identifier.
 * @param {string} userId 
 * @returns {boolean}
 */
function hasMockCustomer(userId) {
  return typeof userId === "string" && Object.prototype.hasOwnProperty.call(mockCustomers, userId);
}

/**
 * Registers a mock customer for testing purposes.
 * Pass null as customerData to explicitly simulate a missing customer in test mode.
 * @param {string} userId 
 * @param {object|null} customerData 
 */
function __setMockCustomer(userId, customerData) {
  if (typeof userId === "string") {
    mockCustomers[userId] = customerData;
  }
}

/**
 * Deletes a single mock customer override.
 * @param {string} userId 
 */
function __deleteMockCustomer(userId) {
  if (typeof userId === "string") {
    delete mockCustomers[userId];
  }
}

/**
 * Clears all mock customer overrides.
 */
function __clearMockCustomers() {
  mockCustomers = Object.create(null);
}

/**
 * Finds customer profile by user ID (or legacy Firebase UID / email).
 * 
 * @param {string} userId 
 * @returns {Promise<object|null>} Customer object or null if not found
 */
async function findById(userId) {
  if (!userId) return null;

  // Check own-key mock registry first (only active when explicitly configured in tests)
  if (hasMockCustomer(userId)) {
    return mockCustomers[userId];
  }

  if (!prisma) {
    if (process.env.NODE_ENV === "test") {
      return null;
    }
    throw new Error("Prisma client is not initialized.");
  }

  const customer = await prisma.user.findFirst({
    where: {
      OR: [
        { id: userId },
        { email: userId },
        { firebaseUid: userId },
      ],
    },
    include: { addresses: true },
  });

  if (!customer) {
    return null;
  }

  return {
    id: customer.id,
    firebaseUid: customer.firebaseUid || customer.id,
    name: customer.name || "",
    email: customer.email || "",
    phone: customer.phone || "",
    addresses: Array.isArray(customer.addresses)
      ? customer.addresses.map((addr) => ({
          id: addr.id,
          street: addr.street,
          city: addr.city,
          state: addr.state,
          postalCode: addr.postalCode,
          isDefault: addr.isDefault || false,
        }))
      : [],
  };
}

/**
 * Alias for findById for backward compatibility
 */
async function findByFirebaseUid(userId) {
  return findById(userId);
}

/**
 * Creates or updates a customer profile.
 * 
 * @param {object} profileData 
 * @returns {Promise<object>} Created or updated customer profile
 */
async function upsertCustomerProfile({ id, userId, firebaseUid, name, email, phone, image }) {
  const targetId = id || userId || firebaseUid;
  if (!targetId) throw new Error("User identifier is required for upserting customer profile");

  if (hasMockCustomer(targetId)) {
    const existing = mockCustomers[targetId];
    const updated = {
      id: existing?.id || targetId,
      firebaseUid: targetId,
      name: name || "",
      email: email || null,
      phone: phone || null,
      addresses: existing?.addresses || [],
    };
    mockCustomers[targetId] = updated;
    return updated;
  }

  if (!prisma) {
    if (process.env.NODE_ENV === "test") {
      const fallback = {
        id: targetId,
        firebaseUid: targetId,
        name: name || "",
        email: email || null,
        phone: phone || null,
        addresses: [],
      };
      mockCustomers[targetId] = fallback;
      return fallback;
    }
    throw new Error("Prisma client is not initialized.");
  }

  const user = await prisma.user.upsert({
    where: { id: targetId },
    update: {
      name: name || undefined,
      email: email || undefined,
      phone: phone || undefined,
      image: image || undefined,
    },
    create: {
      id: targetId,
      name: name || null,
      email: email || null,
      phone: phone || null,
      image: image || null,
      role: "CUSTOMER",
    },
    include: { addresses: true },
  });

  return {
    id: user.id,
    firebaseUid: user.firebaseUid || user.id,
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    addresses: Array.isArray(user.addresses) ? user.addresses : [],
  };
}

module.exports = {
  findById,
  findByFirebaseUid,
  upsertCustomerProfile,
  hasMockCustomer,
  __setMockCustomer,
  __deleteMockCustomer,
  __clearMockCustomers,
};
