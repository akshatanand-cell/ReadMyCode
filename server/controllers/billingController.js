const mongoose = require("mongoose");
const User = require("../models/User");
const memoryStore = require("../utils/memoryStore");
const logger = require("../utils/logger");

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

const PLANS = {
  free: {
    id: "free",
    name: "Free Developer",
    price: 0,
    interval: "forever",
    scanLimit: 15,
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
    interval: "month",
    scanLimit: "unlimited",
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
    interval: "month",
    scanLimit: "unlimited",
    stripePriceId: process.env.STRIPE_TEAM_PRICE_ID || "price_team_monthly",
    features: [
      "Everything in Pro, for up to 10 team seats",
      "Shared team repository workspace & audit logs",
      "Custom AI agent rules & compliance constitution presets",
      "Dedicated webhook pipelines & SLA support",
    ],
  },
};

async function getPlans(req, res) {
  return res.json({
    plans: Object.values(PLANS),
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
    const scanLimit = plan === "free" ? 15 : "unlimited";
    const remainingScans = plan === "free" ? Math.max(0, 15 - monthlyScans) : "unlimited";

    return res.json({
      plan,
      monthlyScans,
      scanLimit,
      remainingScans,
    });
  } catch (err) {
    next(err);
  }
}

async function createCheckoutSession(req, res, next) {
  try {
    const { planId = "pro" } = req.body;
    const userId = req.user?._id;

    if (!userId || userId === "demo_guest") {
      return res.status(401).json({ message: "Please sign in to upgrade your subscription." });
    }

    const selectedPlan = PLANS[planId];
    if (!selectedPlan) {
      return res.status(400).json({ message: "Invalid plan specified." });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (stripeKey && stripeKey.startsWith("sk_")) {
      const stripe = require("stripe")(stripeKey);
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "subscription",
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `ReadMyCode ${selectedPlan.name}`,
                description: selectedPlan.features.slice(0, 3).join(", "),
              },
              unit_amount: selectedPlan.price * 100,
              recurring: { interval: "month" },
            },
            quantity: 1,
          },
        ],
        success_url: `${req.headers.origin || "https://readmycode.vercel.app"}/dashboard?upgraded=true`,
        cancel_url: `${req.headers.origin || "https://readmycode.vercel.app"}/pricing?canceled=true`,
      });

      return res.json({ url: session.url });
    }

    // Demo Mode fallback for testing: instantly upgrade the user account
    if (isDbConnected()) {
      await User.findByIdAndUpdate(userId, { plan: planId });
    } else {
      const user = await memoryStore.findUserById(userId);
      if (user) {
        user.plan = planId;
        memoryStore.saveStore();
      }
    }

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

async function activateProDemo(req, res, next) {
  try {
    const userId = req.user?._id;
    if (!userId || userId === "demo_guest") {
      return res.status(401).json({ message: "Please sign in to activate Pro features." });
    }

    if (isDbConnected()) {
      await User.findByIdAndUpdate(userId, { plan: "pro" });
    } else {
      const user = await memoryStore.findUserById(userId);
      if (user) {
        user.plan = "pro";
        memoryStore.saveStore();
      }
    }

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
  getUsage,
  createCheckoutSession,
  activateProDemo,
  PLANS,
};
