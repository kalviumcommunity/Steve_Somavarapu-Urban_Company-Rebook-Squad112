const customerService = require("../services/customer.service");

async function getCustomerProfile(req, res, next) {
  try {
    const firebaseUid = req.user?.uid;

    if (!firebaseUid) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "User context missing from request.",
        },
      });
    }

    const customer = await customerService.findByFirebaseUid(firebaseUid);

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: {
          code: "CUSTOMER_NOT_FOUND",
          message: `Customer profile not found for user: ${firebaseUid}`,
        },
      });
    }

    return res.status(200).json({
      success: true,
      customer: {
        id: customer.id,
        firebaseUid: customer.firebaseUid,
        name: customer.name || "",
        email: customer.email || "",
        phone: customer.phone || "",
        addresses: Array.isArray(customer.addresses) ? customer.addresses : [],
      },
    });
  } catch (error) {
    next(error);
  }
}

async function upsertCustomerProfile(req, res, next) {
  try {
    const firebaseUid = req.user?.uid;

    if (!firebaseUid) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "User context missing from request.",
        },
      });
    }

    const name = req.body?.name || req.user?.name || "";
    const email = req.body?.email || req.user?.email || "";
    const phone = req.body?.phone || "";
    const image = req.user?.picture || "";

    const customer = await customerService.upsertCustomerProfile({
      firebaseUid,
      name,
      email,
      phone,
      image,
    });

    return res.status(200).json({
      success: true,
      customer: {
        id: customer.id,
        firebaseUid: customer.firebaseUid,
        name: customer.name || "",
        email: customer.email || "",
        phone: customer.phone || "",
        addresses: Array.isArray(customer.addresses) ? customer.addresses : [],
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCustomerProfile,
  upsertCustomerProfile,
};
