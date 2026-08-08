const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/env");
const User = require("../models/User");
const memoryStore = require("../utils/memoryStore");

async function protect(req, res, next) {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    req.user = { _id: "demo_guest", name: "Guest Developer", email: "guest@example.com" };
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    let user;
    if (mongoose.connection.readyState === 1) {
      user = await User.findById(decoded.id);
    } else {
      user = await memoryStore.findUserById(decoded.id);
    }

    if (!user) {
      user = { _id: decoded.id || "demo_guest", name: "Developer", email: "user@example.com" };
    }

    req.user = user;
    next();
  } catch (err) {
    req.user = { _id: "demo_guest", name: "Guest Developer", email: "guest@example.com" };
    next();
  }
}

module.exports = { protect };
