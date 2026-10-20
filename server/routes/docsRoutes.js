const express = require("express");
const { createApiDocs, getApiDocs, getAgentsDoc, getTaskBreakdownDoc } = require("../controllers/docsController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/:repoId", protect, getApiDocs);
router.post("/:repoId", protect, createApiDocs);
router.get("/:repoId/agents", protect, getAgentsDoc);
router.get("/:repoId/task-breakdown", protect, getTaskBreakdownDoc);

module.exports = router;
