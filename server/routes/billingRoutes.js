const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getPlans,
  getGatewayConfig,
  getUsage,
  createCheckoutSession,
  verifyStripeSession,
  createCustomerPortalSession,
  handleStripeWebhook,
  createRazorpayOrder,
  verifyRazorpayPayment,
  handleRazorpayWebhook,
  activateProDemo,
} = require("../controllers/billingController");

router.get("/plans", getPlans);
router.get("/config", getGatewayConfig);
router.get("/usage", protect, getUsage);
router.post("/checkout", protect, createCheckoutSession);
router.get("/verify-session", verifyStripeSession);
router.post("/portal", protect, createCustomerPortalSession);
router.post("/webhook", handleStripeWebhook);
router.post("/razorpay/create-order", protect, createRazorpayOrder);
router.post("/razorpay/verify-payment", protect, verifyRazorpayPayment);
router.post("/razorpay/webhook", handleRazorpayWebhook);
router.post("/activate-pro", protect, activateProDemo);

module.exports = router;
