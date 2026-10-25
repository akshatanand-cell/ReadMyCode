const express = require("express");
const { runDebugger } = require("../controllers/debugController");
const { protect } = require("../middleware/authMiddleware");
const { aiLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

router.post("/", protect, aiLimiter, runDebugger);

module.exports = router;
