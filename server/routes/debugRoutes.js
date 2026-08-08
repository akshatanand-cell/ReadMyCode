const express = require("express");
const { runDebugger } = require("../controllers/debugController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, runDebugger);

module.exports = router;
