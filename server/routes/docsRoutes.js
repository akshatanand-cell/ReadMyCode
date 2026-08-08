const express = require("express");
const { createApiDocs, getApiDocs } = require("../controllers/docsController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/:repoId", protect, getApiDocs);
router.post("/:repoId", protect, createApiDocs);

module.exports = router;
