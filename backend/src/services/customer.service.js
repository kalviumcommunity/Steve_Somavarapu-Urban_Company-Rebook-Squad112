const prisma = require("../config/prisma");

// In-memory mock registry initialized with null prototype
let mockCustomers = Object.create(null);

/**
 * Checks if a mock customer is explicitly registered for a given Firebase UID.
 * @param {string} firebaseUid 
 * @returns {boolean}
 */
function hasMockCustomer(firebaseUid) {
  return typeof firebaseUid === "string" && Object.prototype.hasOwnProperty.call(mockCustomers, firebaseUid);
}

/**
 * Registers a mock customer for testing purposes.
 * Pass null as customerData to explicitly simulate a missing customer in test mode.
 * @param {string} firebaseUid 
 * @param {object|null} customerData 
 */
function __setMockCustomer(firebaseUid, customerData) {
  if (typeof firebaseUid === "string") {
    mockCustomers[firebaseUid] = customerData;
  }
}

/**
 * Deletes a single mock customer override.
 * @param {string} firebaseUid 
 */
function __deleteMockCustomer(firebaseUid) {
  if (typeof firebaseUid === "string") {
    delete mockCustomers[firebaseUid];
  }
}

/**
 * Clears all mock customer overrides.
 */
function __clearMockCustomers() {
  mockCustomers = Object.create(null);
}

/**
 * Finds customer profile by Firebase UID.
 * 
 * @param {string} firebaseUid 
 * @returns {Promise<object|null>} Customer object or null if not found
 */
async function findByFirebaseUid(firebaseUid) {
  if (!firebaseUid) return null;

  // Check own-key mock registry first (only active when explicitly configured in tests)
  if (hasMockCustomer(firebaseUid)) {
    return mockCustomers[firebaseUid];
  }

  if (!prisma) {
    if (process.env.NODE_ENV === "test") {
      return null;
    }
    throw new Error("Prisma client is not initialized.");
  }

  const customer = await prisma.user.findFirst({
    where: { firebaseUid },
    include: { addresses: true },
  });

  if (!customer) {
    return null;
  }

  return {
    id: customer.id,
    firebaseUid: customer.firebaseUid || firebaseUid,
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
 * Creates or updates a customer profile (useful when logging in via Google Auth for the first time).
 * 
 * @param {object} profileData 
 * @returns {Promise<object>} Created or updated customer profile
 */
async function upsertCustomerProfile({ firebaseUid, name, email, phone, image }) {
  if (!firebaseUid) throw new Error("firebaseUid is required for upserting customer profile");

  if (hasMockCustomer(firebaseUid)) {
    const existing = mockCustomers[firebaseUid];
    const updated = {
      id: existing?.id || `cust_${Date.now()}`,
      firebaseUid,
      name: name || "",
      email: email || null,
      phone: phone || null,
      addresses: existing?.addresses || [],
    };
    mockCustomers[firebaseUid] = updated;
    return updated;
  }

  if (!prisma) {
    if (process.env.NODE_ENV === "test") {
      const fallback = {
        id: `cust_${Date.now()}`,
        firebaseUid,
        name: name || "",
        email: email || null,
        phone: phone || null,
        addresses: [],
      };
      mockCustomers[firebaseUid] = fallback;
      return fallback;
    }
    throw new Error("Prisma client is not initialized.");
  }

  const user = await prisma.user.upsert({
    where: { firebaseUid },
    update: {
      name: name || undefined,
      email: email || undefined,
      phone: phone || undefined,
      image: image || undefined,
    },
    create: {
      firebaseUid,
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
    firebaseUid: user.firebaseUid,
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    addresses: Array.isArray(user.addresses) ? user.addresses : [],
  };
}

module.exports = {
  findByFirebaseUid,
  upsertCustomerProfile,
  __setMockCustomer,
  __deleteMockCustomer,
  __clearMockCustomers,
};
