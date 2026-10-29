const express = require("express");
const {
  analyzeRepo,
  analyzeZip,
  getRepo,
  reanalyzeRepo,
  listRepos,
  deleteRepo,
  pushRepoToGitHub,
  getRepoCommits,
  chatWithRepoAi,
} = require("../controllers/repoController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { analysisLimiter, aiLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

router.use(protect);
router.post("/analyze", analysisLimiter, analyzeRepo);
router.post("/upload", upload.single("file"), analysisLimiter, analyzeZip);
router.get("/", listRepos);
router.get("/:id", getRepo);
router.get("/:id/commits", getRepoCommits);
router.post("/:id/chat", aiLimiter, chatWithRepoAi);
router.post("/:id/analyze", analysisLimiter, reanalyzeRepo);
router.post("/:id/push-to-github", pushRepoToGitHub);
router.delete("/:id", deleteRepo);

module.exports = router;
