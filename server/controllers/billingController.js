const mongoose = require("mongoose");
const crypto = require("crypto");
const User = require("../models/User");
const memoryStore = require("../utils/memoryStore");
const logger = require("../utils/logger");
const { sendPaymentSuccessEmail } = require("../services/emailService");

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

const PLANS = {
  free: {
    id: "free",
    name: "Free Developer",
    price: 0,
    priceInr: 0,
    interval: "forever",
    scanLimit: 15,
    popular: false,
    features: [
      "15 repository scans per month",
      "Public GitHub repositories & ZIP uploads (up to 4MB)",
      "Standard AST & Markdown specification generation",
      "Interactive Mermaid architecture & flowcharts",
      "Community support",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro Engineer",
    price: 12,
    priceInr: 999,
    interval: "month",
    scanLimit: "unlimited",
    popular: true,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || "price_pro_monthly",
    features: [
      "Unlimited repository & codebase scans",
      "Private GitHub repositories & fine-grained token support",
      "Deep Grok-2 & Llama 70B extended context reasoning",
      "High-resolution SVG & PNG diagram vector exports",
      "Automated GitHub Action continuous doc updates",
      "Priority serverless compute queues",
    ],
  },
  team: {
    id: "team",
    name: "Team & Enterprise",
    price: 49,
    priceInr: 3999,
    interval: "month",
    scanLimit: "unlimited",
    popular: false,
    stripePriceId: process.env.STRIPE_TEAM_PRICE_ID || "price_team_monthly",
    features: [
      "Everything in Pro, for up to 10 team seats",
      "Shared team repository workspace & audit logs",
      "Custom AI agent rules & compliance constitution presets",
      "Dedicated webhook pipelines & SLA support",
      "Priority email & Slack support",
    ],
  },
  pack_50: {
    id: "pack_50",
    name: "50-Scans Power Pack",
    price: 19,
    priceInr: 1499,
    interval: "one-time",
    scanLimit: 50,
    popular: false,
    stripePriceId: process.env.STRIPE_PACK50_PRICE_ID || "price_pack_50",
    features: [
      "50 deep repository analyses (no recurring monthly fees)",
      "Never expires — valid for lifetime of your account",
      "Private GitHub repos & fine-grained token support",
      "Full vector SVG exports & AI debugging reports",
    ],
  },
  lifetime: {
    id: "lifetime",
    name: "Lifetime License",
    price: 99,
    priceInr: 7999,
    interval: "one-time",
    scanLimit: "unlimited",
    popular: false,
    stripePriceId: process.env.STRIPE_LIFETIME_PRICE_ID || "price_lifetime",
    features: [
      "Unlimited lifetime repository & codebase scans",
      "Pay once, own forever — zero recurring subscription fees",
      "All future Pro features and AI model upgrades included",
      "Permanent priority serverless compute queue",
    ],
  },
};

/**
 * Shared helper to upgrade user account and persist changes
 */
async function upgradeUserAccount(userId, planId, details = {}) {
  if (!userId || userId === "demo_guest") return;
  const plan = PLANS[planId] || PLANS.pro;

  const updateFields = {
    plan: planId,
    paymentGateway: details.gateway || "demo",
    subscriptionStatus: "active",
  };
  if (details.stripeCustomerId) updateFields.stripeCustomerId = details.stripeCustomerId;
  if (details.stripeSubscriptionId) updateFields.stripeSubscriptionId = details.stripeSubscriptionId;
  if (details.razorpayPaymentId) updateFields.razorpayPaymentId = details.razorpayPaymentId;
  if (details.razorpayOrderId) updateFields.razorpayOrderId = details.razorpayOrderId;

  let userEmail = details.customerEmail;
  let userName = details.customerName;

  if (isDbConnected()) {
    let updateQuery = { ...updateFields };
    if (planId === "pack_50") {
      updateQuery.$inc = { purchasedCredits: 50 };
    }
    const updatedUser = await User.findByIdAndUpdate(userId, updateQuery, { new: true });
    if (updatedUser) {
      userEmail = userEmail || updatedUser.email;
      userName = userName || updatedUser.name;
    }
  } else {
    const user = await memoryStore.findUserById(userId);
    if (user) {
      user.plan = planId;
      user.paymentGateway = updateFields.paymentGateway;
      if (details.stripeCustomerId) user.stripeCustomerId = details.stripeCustomerId;
      if (details.stripeSubscriptionId) user.stripeSubscriptionId = details.stripeSubscriptionId;
      if (details.razorpayPaymentId) user.razorpayPaymentId = details.razorpayPaymentId;
      if (planId === "pack_50") user.purchasedCredits = (user.purchasedCredits || 0) + 50;
      memoryStore.saveStore();
      userEmail = userEmail || user.email;
      userName = userName || user.name;
    }
  }

  // Dispatch payment confirmation email
  if (userEmail) {
    try {
      await sendPaymentSuccessEmail({
        to: userEmail,
        name: userName || "Developer",
        planName: plan.name,
        amount: details.amount || (details.currency === "inr" ? plan.priceInr : plan.price),
        currency: details.currency || "usd",
        gateway: details.gateway || "Card",
      });
    } catch (e) {
      logger.warn(`Failed to dispatch payment confirmation email: ${e.message}`);
    }
  }

  logger.info(`Successfully upgraded user ${userId} to ${planId} via ${details.gateway || "demo"}`);
}

async function getPlans(req, res) {
  return res.json({
    plans: Object.values(PLANS),
  });
}

/**
 * Returns available payment gateway configuration for the client
 */
async function getGatewayConfig(req, res) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const razorpayId = process.env.RAZORPAY_KEY_ID;
  const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

  return res.json({
    stripe: {
      enabled: Boolean(stripeSecret && stripeSecret.startsWith("sk_")),
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "",
    },
    razorpay: {
      enabled: Boolean(razorpayId && razorpaySecret),
      keyId: razorpayId || "",
    },
    currencyDefault: razorpayId ? "inr" : "usd",
  });
}

async function getUsage(req, res, next) {
  try {
    const userId = req.user?._id;
    if (!userId || userId === "demo_guest") {
      return res.json({
        plan: "free",
        monthlyScans: 0,
        scanLimit: 15,
        remainingScans: 15,
      });
    }

    let user;
    if (isDbConnected()) {
      user = await User.findById(userId);
    } else {
      user = await memoryStore.findUserById(userId);
    }

    const plan = user?.plan || "free";
    const monthlyScans = user?.monthlyScans || 0;
    const purchasedCredits = user?.purchasedCredits || 0;

    let scanLimit = 15;
    let remainingScans = 15;

    if (plan === "pro" || plan === "team" || plan === "lifetime") {
      scanLimit = "unlimited";
      remainingScans = "unlimited";
    } else if (plan === "pack_50") {
      scanLimit = 15 + purchasedCredits;
      remainingScans = Math.max(0, scanLimit - monthlyScans);
    } else {
      remainingScans = Math.max(0, 15 - monthlyScans);
    }

    return res.json({
      plan,
      monthlyScans,
      scanLimit,
      remainingScans,
      paymentGateway: user?.paymentGateway || "none",
      hasStripeSubscription: Boolean(user?.stripeSubscriptionId),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Creates a Stripe Checkout Session for recurring subscriptions or one-time packs
 */
async function createCheckoutSession(req, res, next) {
  try {
    const { planId = "pro" } = req.body;
    const userId = req.user?._id;
    const userEmail = req.user?.email;

    if (!userId || userId === "demo_guest") {
      return res.status(401).json({ message: "Please sign in to upgrade your subscription." });
    }

    const selectedPlan = PLANS[planId];
    if (!selectedPlan) {
      return res.status(400).json({ message: "Invalid plan specified." });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (stripeKey && stripeKey.startsWith("sk_")) {
      const Stripe = require("stripe");
      const stripe = new Stripe(stripeKey);

      const clientOrigin = req.headers.origin || "https://readmycode.vercel.app";
      const isSubscription = selectedPlan.interval === "month";

      const sessionPayload = {
        payment_method_types: ["card"],
        mode: isSubscription ? "subscription" : "payment",
        client_reference_id: userId.toString(),
        customer_email: userEmail || undefined,
        metadata: {
          userId: userId.toString(),
          planId: selectedPlan.id,
          planName: selectedPlan.name,
        },
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `ReadMyCode ${selectedPlan.name}`,
                description: selectedPlan.features.slice(0, 3).join(", "),
              },
              unit_amount: selectedPlan.price * 100,
              ...(isSubscription ? { recurring: { interval: "month" } } : {}),
            },
            quantity: 1,
          },
        ],
        success_url: `${clientOrigin}/dashboard?upgraded=true&plan=${selectedPlan.id}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${clientOrigin}/pricing?canceled=true`,
      };

      if (isSubscription) {
        sessionPayload.subscription_data = {
          metadata: {
            userId: userId.toString(),
            planId: selectedPlan.id,
          },
        };
      }

      const session = await stripe.checkout.sessions.create(sessionPayload);
      return res.json({ url: session.url, sessionId: session.id });
    }

    // Demo Mode fallback for development and testing environments without API keys
    await upgradeUserAccount(userId, planId, { gateway: "demo", customerEmail: userEmail });

    logger.info(`Upgraded user ${userId} to ${planId} (Demo Activation)`);
    return res.json({
      success: true,
      plan: planId,
      message: `Successfully upgraded to ${selectedPlan.name}!`,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Instantly verify a completed Stripe Checkout session upon customer return
 */
async function verifyStripeSession(req, res, next) {
  try {
    const { session_id } = req.query;
    if (!session_id || !session_id.startsWith("cs_")) {
      return res.status(400).json({ message: "Invalid session_id parameter." });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey || !stripeKey.startsWith("sk_")) {
      return res.status(503).json({ message: "Stripe is not configured in this environment." });
    }

    const Stripe = require("stripe");
    const stripe = new Stripe(stripeKey);
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid" && session.status !== "complete") {
      return res.status(400).json({ message: "Checkout session is not paid.", status: session.payment_status });
    }

    const userId = session.client_reference_id || session.metadata?.userId;
    const planId = session.metadata?.planId || "pro";

    if (userId) {
      await upgradeUserAccount(userId, planId, {
        gateway: "stripe",
        stripeCustomerId: session.customer,
        stripeSubscriptionId: session.subscription,
        customerEmail: session.customer_details?.email,
        customerName: session.customer_details?.name,
        amount: (session.amount_total || 0) / 100,
        currency: session.currency || "usd",
      });
    }

    return res.json({
      success: true,
      plan: planId,
      message: "Subscription successfully confirmed and active!",
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Opens Stripe Customer Portal for self-serve cancellation and payment method updates
 */
async function createCustomerPortalSession(req, res, next) {
  try {
    const userId = req.user?._id;
    if (!userId || userId === "demo_guest") {
      return res.status(401).json({ message: "Please sign in." });
    }

    let user;
    if (isDbConnected()) {
      user = await User.findById(userId);
    } else {
      user = await memoryStore.findUserById(userId);
    }

    if (!user?.stripeCustomerId) {
      return res.status(400).json({
        message: "No active Stripe customer found for this account. Self-service portal is available for Stripe subscribers.",
      });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey || !stripeKey.startsWith("sk_")) {
      return res.status(503).json({ message: "Stripe is not configured." });
    }

    const Stripe = require("stripe");
    const stripe = new Stripe(stripeKey);
    const clientOrigin = req.headers.origin || "https://readmycode.vercel.app";

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${clientOrigin}/dashboard`,
    });

    return res.json({ url: portalSession.url });
  } catch (err) {
    next(err);
  }
}

/**
 * Stripe Webhook Handler for asynchronous events
 */
async function handleStripeWebhook(req, res) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || !webhookSecret) {
    logger.warn("Stripe webhook invoked but secret keys are missing.");
    return res.status(400).send("Webhook secret not configured");
  }

  const Stripe = require("stripe");
  const stripe = new Stripe(stripeKey);
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    const rawBody = req.rawBody || req.body;
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    logger.error(`Stripe Webhook Signature Verification Failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.client_reference_id || session.metadata?.userId;
        const planId = session.metadata?.planId || "pro";

        if (userId) {
          await upgradeUserAccount(userId, planId, {
            gateway: "stripe",
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
            customerEmail: session.customer_details?.email,
            customerName: session.customer_details?.name,
            amount: (session.amount_total || 0) / 100,
            currency: session.currency || "usd",
          });
        }
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        if (isDbConnected()) {
          await User.findOneAndUpdate(
            { stripeCustomerId: customerId },
            { plan: "free", subscriptionStatus: "canceled" }
          );
        }
        logger.info(`Canceled subscription for customer ${customerId}`);
        break;
      }
      default:
        logger.info(`Unhandled Stripe webhook event: ${event.type}`);
    }
    return res.json({ received: true });
  } catch (err) {
    logger.error(`Error processing Stripe webhook: ${err.message}`);
    return res.status(500).json({ error: "Webhook processing error" });
  }
}

/**
 * Creates a Razorpay Order for Indian domestic and UPI payments
 */
async function createRazorpayOrder(req, res, next) {
  try {
    const { planId = "pro" } = req.body;
    const userId = req.user?._id;
    const userEmail = req.user?.email;

    if (!userId || userId === "demo_guest") {
      return res.status(401).json({ message: "Please sign in to continue." });
    }

    const selectedPlan = PLANS[planId];
    if (!selectedPlan) {
      return res.status(400).json({ message: "Invalid plan specified." });
    }

    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpayKeyId || !razorpayKeySecret) {
      return res.status(503).json({
        message: "Razorpay is not enabled. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
      });
    }

    const Razorpay = require("razorpay");
    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    const amountInPaise = selectedPlan.priceInr * 100;
    const receipt = `rmc_${String(userId).slice(-8)}_${Date.now()}`;

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt,
      notes: {
        userId: String(userId),
        planId: selectedPlan.id,
        planName: selectedPlan.name,
      },
    });

    return res.json({
      orderId: order.id,
      amount: order.amount,
      currency: "INR",
      keyId: razorpayKeyId,
      plan: selectedPlan,
      user: { email: userEmail, name: req.user?.name },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Verifies Razorpay payment signature and upgrades user
 */
async function verifyRazorpayPayment(req, res, next) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId = "pro",
    } = req.body;
    const userId = req.user?._id;

    if (!userId || userId === "demo_guest") {
      return res.status(401).json({ message: "Authentication required." });
    }

    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!razorpayKeySecret) {
      return res.status(503).json({ message: "Razorpay key secret not configured." });
    }

    const bodyToSign = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", razorpayKeySecret)
      .update(bodyToSign)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature verification." });
    }

    const selectedPlan = PLANS[planId] || PLANS.pro;
    await upgradeUserAccount(userId, selectedPlan.id, {
      gateway: "razorpay",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      customerEmail: req.user?.email,
      customerName: req.user?.name,
      amount: selectedPlan.priceInr,
      currency: "inr",
    });

    return res.json({
      success: true,
      plan: selectedPlan.id,
      message: `Payment verified! Welcome to ${selectedPlan.name}.`,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Razorpay Webhook backup
 */
async function handleRazorpayWebhook(req, res) {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) return res.status(200).json({ received: true });

    const signature = req.headers["x-razorpay-signature"];
    const rawBody = req.rawBody ? req.rawBody.toString() : JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (signature !== expectedSignature) {
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    const event = req.body;
    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const userId = payment.notes?.userId;
      const planId = payment.notes?.planId || "pro";
      if (userId) {
        await upgradeUserAccount(userId, planId, {
          gateway: "razorpay",
          razorpayPaymentId: payment.id,
          amount: payment.amount / 100,
          currency: "inr",
        });
      }
    }

    return res.json({ received: true });
  } catch (err) {
    logger.error(`Razorpay webhook error: ${err.message}`);
    return res.status(500).json({ error: "Webhook failure" });
  }
}

async function activateProDemo(req, res, next) {
  try {
    const userId = req.user?._id;
    if (!userId || userId === "demo_guest") {
      return res.status(401).json({ message: "Please sign in to activate Pro features." });
    }

    await upgradeUserAccount(userId, "pro", { gateway: "demo", customerEmail: req.user?.email });

    return res.json({
      success: true,
      plan: "pro",
      message: "Pro subscription activated! Enjoy unlimited scans, private repos, and priority compute.",
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
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
  PLANS,
};
