const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getPlans,
  getUsage,
  createCheckoutSession,
  activateProDemo,
} = require("../controllers/billingController");

router.get("/plans", getPlans);
router.get("/usage", protect, getUsage);
router.post("/checkout", protect, createCheckoutSession);
router.post("/activate-pro", protect, activateProDemo);

module.exports = router;
