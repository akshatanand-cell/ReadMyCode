const express = require("express");
const {
  createFlowchart,
  getFlowchart,
  createArchitectureDiagram,
  getArchitectureDiagram,
} = require("../controllers/diagramController");
const {
  createFunctionExplanations,
  getFunctionExplanations,
} = require("../controllers/functionExplainController");
const { protect } = require("../middleware/authMiddleware");
const { aiLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

router.get("/flowchart/:repoId", protect, getFlowchart);
router.post("/flowchart/:repoId", protect, aiLimiter, createFlowchart);

router.get("/architecture/:repoId", protect, getArchitectureDiagram);
router.post("/architecture/:repoId", protect, aiLimiter, createArchitectureDiagram);

router.get("/functions/:repoId", protect, getFunctionExplanations);
router.post("/functions/:repoId", protect, aiLimiter, createFunctionExplanations);

module.exports = router;
