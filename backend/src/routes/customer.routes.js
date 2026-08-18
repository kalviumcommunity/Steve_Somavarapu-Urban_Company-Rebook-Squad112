const express = require("express");
const { requireAuth } = require("../middleware/auth.middleware");
const { getCustomerProfile, upsertCustomerProfile } = require("../controllers/customer.controller");

const router = express.Router();

router.get("/profile", requireAuth, getCustomerProfile);
router.post("/profile", requireAuth, upsertCustomerProfile);

module.exports = router;
