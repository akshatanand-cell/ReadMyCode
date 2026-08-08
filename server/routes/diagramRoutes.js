const express = require("express");
const { createFlowchart, getFlowchart, createArchitectureDiagram, getArchitectureDiagram } = require("../controllers/diagramController");
const { createFunctionExplanations, getFunctionExplanations } = require("../controllers/functionExplainController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/flowchart/:repoId", protect, getFlowchart);
router.post("/flowchart/:repoId", protect, createFlowchart);

router.get("/architecture/:repoId", protect, getArchitectureDiagram);
router.post("/architecture/:repoId", protect, createArchitectureDiagram);

router.get("/functions/:repoId", protect, getFunctionExplanations);
router.post("/functions/:repoId", protect, createFunctionExplanations);

module.exports = router;
