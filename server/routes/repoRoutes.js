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
} = require("../controllers/repoController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.use(protect);
router.post("/analyze", analyzeRepo);
router.post("/upload", upload.single("file"), analyzeZip);
router.get("/", listRepos);
router.get("/:id", getRepo);
router.get("/:id/commits", getRepoCommits);
router.post("/:id/analyze", reanalyzeRepo);
router.post("/:id/push-to-github", pushRepoToGitHub);
router.delete("/:id", deleteRepo);

module.exports = router;