const express = require("express");
const {
  register,
  login,
  getMe,
  logout,
  updateProfile,
  forgotPassword,
  resetPassword,
  getSecurityQuestion,
  resetPasswordWithSecurityQuestion,
  githubAuth,
  getUserGithubRepos,
  getGithubConfig,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { authLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);
router.put("/profile", protect, updateProfile);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);
router.post("/security-question", getSecurityQuestion);
router.post("/reset-password-security", resetPasswordWithSecurityQuestion);
router.post("/github", githubAuth);
router.get("/github/config", getGithubConfig);
router.get("/github/repos", protect, getUserGithubRepos);

module.exports = router;
