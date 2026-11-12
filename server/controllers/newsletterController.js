const mongoose = require("mongoose");
const crypto = require("crypto");
const Subscriber = require("../models/Subscriber");
const User = require("../models/User");
const { sendNewsletterWelcomeEmail } = require("../services/emailService");
const logger = require("../utils/logger");

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

// In-memory fallback for serverless cold instances without active DB
const memorySubscribers = new Map();

async function subscribe(req, res, next) {
  try {
    const { email } = req.body;
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: "Please provide a valid email address." });
    }

    const cleanEmail = email.toLowerCase().trim();
    const token = crypto.randomBytes(24).toString("hex");

    if (isDbConnected()) {
      let sub = await Subscriber.findOne({ email: cleanEmail });
      if (sub) {
        sub.status = "subscribed";
        sub.unsubscribedAt = null;
        await sub.save();
      } else {
        sub = await Subscriber.create({
          email: cleanEmail,
          status: "subscribed",
          unsubscribeToken: token,
        });
      }

      // Also update User record if registered
      await User.findOneAndUpdate({ email: cleanEmail }, { newsletterSubscribed: true });
    } else {
      memorySubscribers.set(cleanEmail, {
        email: cleanEmail,
        status: "subscribed",
        unsubscribeToken: token,
      });
    }

    // Trigger automated welcome email
    sendNewsletterWelcomeEmail({ to: cleanEmail, unsubscribeToken: token }).catch((err) =>
      logger.warn(`Newsletter welcome email skipped/failed: ${err.message}`)
    );

    return res.status(200).json({
      success: true,
      message: "Thank you for subscribing! Check your inbox for confirmation.",
    });
  } catch (err) {
    next(err);
  }
}

async function unsubscribe(req, res, next) {
  try {
    const email = (req.body.email || req.query.email || "").toLowerCase().trim();
    const token = req.body.token || req.query.token;

    if (!email) {
      return res.status(400).json({ message: "Email is required to unsubscribe." });
    }

    if (isDbConnected()) {
      const sub = await Subscriber.findOne({ email });
      if (sub) {
        sub.status = "unsubscribed";
        sub.unsubscribedAt = new Date();
        await sub.save();
      }
      await User.findOneAndUpdate({ email }, { newsletterSubscribed: false });
    } else {
      const sub = memorySubscribers.get(email);
      if (sub) {
        sub.status = "unsubscribed";
        sub.unsubscribedAt = new Date();
      }
    }

    logger.info(`Unsubscribed ${email} from marketing dispatches`);

    return res.status(200).json({
      success: true,
      message: "You have been successfully unsubscribed from all marketing emails.",
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  subscribe,
  unsubscribe,
};
