const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const { JWT_SECRET, JWT_EXPIRES_IN, CLIENT_URL } = require("../config/env");
const { sendPasswordResetEmail } = require("../services/emailService");
const logger = require("../utils/logger");
const memoryStore = require("../utils/memoryStore");

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

function signToken(id) {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email, and password are required" });
    }

    let existing, user;
    if (isDbConnected()) {
      existing = await User.findOne({ email });
      if (existing) return res.status(409).json({ message: "Email already registered" });
      user = await User.create({ name, email, password });
    } else {
      existing = await memoryStore.findUserByEmail(email);
      if (existing) return res.status(409).json({ message: "Email already registered" });
      user = await memoryStore.createUser({ name, email, password });
    }

    const token = signToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        githubUsername: user.githubUsername || null,
        hasGithubToken: Boolean(user.githubToken),
      },
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    let user;
    const defaultName = email.split("@")[0] || "User";

    if (isDbConnected()) {
      user = await User.findOne({ email }).select("+password");
      if (!user) {
        user = await User.create({ name: defaultName, email, password });
      } else {
        const isValid = await user.comparePassword(password);
        if (!isValid) {
          return res.status(401).json({ message: "Invalid email or password" });
        }
      }
    } else {
      user = await memoryStore.findUserByEmail(email);
      if (!user) {
        user = await memoryStore.createUser({ name: defaultName, email, password });
      } else {
        const isValid = await user.comparePassword(password);
        if (!isValid) {
          return res.status(401).json({ message: "Invalid email or password" });
        }
      }
    }

    const token = signToken(user._id);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        githubUsername: user.githubUsername || null,
        hasGithubToken: Boolean(user.githubToken),
      },
    });
  } catch (err) {
    next(err);
  }
}

async function getMe(req, res) {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      githubUsername: req.user.githubUsername || null,
      hasGithubToken: Boolean(req.user.githubToken),
    },
  });
}

/**
 * JWTs are stateless here (no server-side session/blacklist), so there's
 * nothing to invalidate server-side. This endpoint exists so the frontend
 * has a consistent call to make; the client is responsible for discarding
 * the token. Kept as a real endpoint (not just a no-op locally) in case a
 * token blacklist/session store gets added later.
 */
async function logout(req, res) {
  res.json({ message: "Logged out successfully" });
}

async function updateProfile(req, res, next) {
  try {
    const { name, email, password, githubToken, githubUsername } = req.body;
    let user;

    if (isDbConnected()) {
      user = await User.findById(req.user._id).select("+password +githubToken");
      if (!user) return res.status(404).json({ message: "User not found" });

      if (email && email !== user.email) {
        const existing = await User.findOne({ email });
        if (existing) return res.status(409).json({ message: "Email already in use" });
        user.email = email;
      }

      if (name) user.name = name;
      if (password) user.password = password; // pre-save hook re-hashes
      if (githubToken !== undefined) user.githubToken = githubToken;
      if (githubUsername !== undefined) user.githubUsername = githubUsername;
      await user.save();
    } else {
      user = await memoryStore.findUserById(req.user._id);
      if (!user) {
        user = {
          _id: req.user._id,
          name: name || req.user.name,
          email: email || req.user.email,
          githubToken: githubToken || null,
          githubUsername: githubUsername || null,
        };
      } else {
        if (name) user.name = name;
        if (email) user.email = email;
        if (githubToken !== undefined) user.githubToken = githubToken;
        if (githubUsername !== undefined) user.githubUsername = githubUsername;
      }
      memoryStore.saveStore();
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        githubUsername: user.githubUsername || null,
        hasGithubToken: Boolean(user.githubToken),
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Generates a reset token, stores its hash + expiry on the user, and emails
 * the reset link via Resend. The raw token is never returned in the API
 * response - it only ever exists in the emailed link and the hashed
 * version stored on the user, which is the whole point of email-based
 * verification.
 */
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "email is required" });

    let user;
    if (isDbConnected()) {
      user = await User.findOne({ email });
    } else {
      user = await memoryStore.findUserByEmail(email);
    }

    if (!user) {
      return res.json({ message: "If that email is registered, a reset link has been sent." });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashed = crypto.createHash("sha256").update(rawToken).digest("hex");

    if (isDbConnected()) {
      user.resetPasswordToken = hashed;
      user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
      await user.save();
    } else {
      user.resetPasswordToken = hashed;
      user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
    }

    const resetUrl = `${CLIENT_URL}/reset-password/${rawToken}`;

    try {
      await sendPasswordResetEmail({ to: user.email, resetUrl, name: user.name });
    } catch (emailErr) {
      logger.error(`[auth] Failed to send reset email to ${email}: ${emailErr.message}`);
    }

    res.json({ message: "If that email is registered, a reset link has been sent." });
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: "token and password are required" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    let user;

    if (isDbConnected()) {
      user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() },
      }).select("+resetPasswordToken +resetPasswordExpire");

      if (!user) {
        return res.status(400).json({ message: "Reset token is invalid or has expired" });
      }

      user.password = password; // pre-save hook re-hashes
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
    } else {
      // In-memory lookup
      for (const u of memoryStore.memoryDb.users.values()) {
        if (u.resetPasswordToken === hashedToken && u.resetPasswordExpire > Date.now()) {
          user = u;
          break;
        }
      }
      if (!user) {
        return res.status(400).json({ message: "Reset token is invalid or has expired" });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      delete user.resetPasswordToken;
      delete user.resetPasswordExpire;
    }

    const newAuthToken = signToken(user._id);
    res.json({ message: "Password reset successful", token: newAuthToken });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, getMe, logout, updateProfile, forgotPassword, resetPassword };