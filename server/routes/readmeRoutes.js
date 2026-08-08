const express = require("express");
const { createReadme, getReadme } = require("../controllers/readmeController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/:repoId", protect, getReadme);
router.post("/:repoId", protect, createReadme);

module.exports = router;