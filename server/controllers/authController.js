const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { JWT_SECRET, JWT_EXPIRES_IN, CLIENT_URL, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = require("../config/env");
const { sendPasswordResetEmail } = require("../services/emailService");
const logger = require("../utils/logger");
const memoryStore = require("../utils/memoryStore");

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

function signToken(id) {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

async function register(req, res, next) {
  try {
    const { name, email, password, securityQuestion, securityAnswer } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email, and password are required" });
    }

    let existing, user;
    let hashedSecurityAnswer = null;
    if (securityAnswer) {
      const salt = await bcrypt.genSalt(10);
      hashedSecurityAnswer = await bcrypt.hash(securityAnswer.toLowerCase().trim(), salt);
    }

    if (isDbConnected()) {
      existing = await User.findOne({ email });
      if (existing) return res.status(409).json({ message: "Email already registered" });
      user = await User.create({
        name,
        email,
        password,
        securityQuestion: securityQuestion || null,
        securityAnswer: hashedSecurityAnswer,
      });
    } else {
      existing = await memoryStore.findUserByEmail(email);
      if (existing) return res.status(409).json({ message: "Email already registered" });
      user = await memoryStore.createUser({
        name,
        email,
        password,
        securityQuestion: securityQuestion || null,
        securityAnswer,
      });
    }

    const token = signToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        githubUsername: user.githubUsername || null,
        hasGithubToken: Boolean(user.githubToken),
      },
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    let user;
    const defaultName = email.split("@")[0] || "User";

    if (isDbConnected()) {
      user = await User.findOne({ email }).select("+password");
      if (!user) {
        user = await User.create({ name: defaultName, email, password });
      } else {
        const isValid = await user.comparePassword(password);
        if (!isValid) {
          return res.status(401).json({ message: "Invalid email or password" });
        }
      }
    } else {
      user = await memoryStore.findUserByEmail(email);
      if (!user) {
        user = await memoryStore.createUser({ name: defaultName, email, password });
      } else {
        const isValid = await user.comparePassword(password);
        if (!isValid) {
          return res.status(401).json({ message: "Invalid email or password" });
        }
      }
    }

    const token = signToken(user._id);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        githubUsername: user.githubUsername || null,
        hasGithubToken: Boolean(user.githubToken),
      },
    });
  } catch (err) {
    next(err);
  }
}

async function getMe(req, res) {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      githubUsername: req.user.githubUsername || null,
      hasGithubToken: Boolean(req.user.githubToken),
    },
  });
}

/**
 * JWTs are stateless here (no server-side session/blacklist), so there's
 * nothing to invalidate server-side. This endpoint exists so the frontend
 * has a consistent call to make; the client is responsible for discarding
 * the token. Kept as a real endpoint (not just a no-op locally) in case a
 * token blacklist/session store gets added later.
 */
async function logout(req, res) {
  res.json({ message: "Logged out successfully" });
}

async function updateProfile(req, res, next) {
  try {
    const { name, email, password, githubToken, githubUsername } = req.body;
    let user;

    if (isDbConnected()) {
      user = await User.findById(req.user._id).select("+password +githubToken");
      if (!user) return res.status(404).json({ message: "User not found" });

      if (email && email !== user.email) {
        const existing = await User.findOne({ email });
        if (existing) return res.status(409).json({ message: "Email already in use" });
        user.email = email;
      }

      if (name) user.name = name;
      if (password) user.password = password; // pre-save hook re-hashes
      if (githubToken !== undefined) user.githubToken = githubToken;
      if (githubUsername !== undefined) user.githubUsername = githubUsername;
      await user.save();
    } else {
      user = await memoryStore.findUserById(req.user._id);
      if (!user) {
        user = {
          _id: req.user._id,
          name: name || req.user.name,
          email: email || req.user.email,
          githubToken: githubToken || null,
          githubUsername: githubUsername || null,
        };
      } else {
        if (name) user.name = name;
        if (email) user.email = email;
        if (githubToken !== undefined) user.githubToken = githubToken;
        if (githubUsername !== undefined) user.githubUsername = githubUsername;
      }
      memoryStore.saveStore();
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        githubUsername: user.githubUsername || null,
        hasGithubToken: Boolean(user.githubToken),
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Generates a reset token, stores its hash + expiry on the user, and emails
 * the reset link via Resend. The raw token is never returned in the API
 * response - it only ever exists in the emailed link and the hashed
 * version stored on the user, which is the whole point of email-based
 * verification.
 */
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "email is required" });

    let user;
    if (isDbConnected()) {
      user = await User.findOne({ email });
    } else {
      user = await memoryStore.findUserByEmail(email);
    }

    if (!user) {
      return res.json({ message: "If that email is registered, a reset link has been sent." });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashed = crypto.createHash("sha256").update(rawToken).digest("hex");

    if (isDbConnected()) {
      user.resetPasswordToken = hashed;
      user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
      await user.save();
    } else {
      user.resetPasswordToken = hashed;
      user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
    }

    const resetUrl = `${CLIENT_URL}/reset-password/${rawToken}`;

    try {
      await sendPasswordResetEmail({ to: user.email, resetUrl, name: user.name });
    } catch (emailErr) {
      logger.error(`[auth] Failed to send reset email to ${email}: ${emailErr.message}`);
    }

    res.json({ message: "If that email is registered, a reset link has been sent." });
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: "token and password are required" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    let user;

    if (isDbConnected()) {
      user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() },
      }).select("+resetPasswordToken +resetPasswordExpire");

      if (!user) {
        return res.status(400).json({ message: "Reset token is invalid or has expired" });
      }

      user.password = password; // pre-save hook re-hashes
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
    } else {
      // In-memory lookup
      for (const u of memoryStore.memoryDb.users.values()) {
        if (u.resetPasswordToken === hashedToken && u.resetPasswordExpire > Date.now()) {
          user = u;
          break;
        }
      }
      if (!user) {
        return res.status(400).json({ message: "Reset token is invalid or has expired" });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      delete user.resetPasswordToken;
      delete user.resetPasswordExpire;
    }

    const newAuthToken = signToken(user._id);
    res.json({ message: "Password reset successful", token: newAuthToken });
  } catch (err) {
    next(err);
  }
}

async function getSecurityQuestion(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    let user;
    if (isDbConnected()) {
      user = await User.findOne({ email }).select("+securityQuestion");
    } else {
      user = await memoryStore.findUserByEmail(email);
    }

    if (!user || !user.securityQuestion) {
      return res.status(404).json({
        message: "No security question found for this account. Please verify your email or contact support.",
      });
    }

    res.json({
      email: user.email,
      securityQuestion: user.securityQuestion,
    });
  } catch (err) {
    next(err);
  }
}

async function resetPasswordWithSecurityQuestion(req, res, next) {
  try {
    const { email, securityAnswer, newPassword } = req.body;
    if (!email || !securityAnswer || !newPassword) {
      return res.status(400).json({ message: "Email, security answer, and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    let user;
    if (isDbConnected()) {
      user = await User.findOne({ email }).select("+password +securityAnswer +securityQuestion");
    } else {
      user = await memoryStore.findUserByEmail(email);
    }

    if (!user) {
      return res.status(404).json({ message: "Account not found with this email" });
    }

    if (!user.securityAnswer) {
      return res.status(400).json({ message: "No security answer was set up for this account" });
    }

    let isAnswerCorrect = false;
    if (typeof user.compareSecurityAnswer === "function") {
      isAnswerCorrect = await user.compareSecurityAnswer(securityAnswer);
    } else {
      isAnswerCorrect = await bcrypt.compare(securityAnswer.toLowerCase().trim(), user.securityAnswer);
    }

    if (!isAnswerCorrect) {
      return res.status(400).json({ message: "Incorrect security answer. Please check your answer and try again." });
    }

    if (isDbConnected()) {
      user.password = newPassword; // pre-save hook re-hashes
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
    } else {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      delete user.resetPasswordToken;
      delete user.resetPasswordExpire;
      memoryStore.saveStore();
    }

    const token = signToken(user._id);

    res.json({
      message: "Password reset successful! You are now logged in.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        githubUsername: user.githubUsername || null,
        hasGithubToken: Boolean(user.githubToken),
      },
    });
  } catch (err) {
    next(err);
  }
}

async function githubAuth(req, res, next) {
  try {
    const { code, token: inputToken, username: inputUsername } = req.body;
    let ghToken = inputToken;

    // If OAuth code provided, exchange it for access token
    if (code && GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET) {
      const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code,
        }),
      });
      const tokenData = await tokenRes.json();
      if (tokenData.access_token) {
        ghToken = tokenData.access_token;
      } else {
        return res.status(400).json({ message: tokenData.error_description || "GitHub authentication failed" });
      }
    }

    let ghUser = null;
    if (ghToken) {
      const ghRes = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${ghToken}`,
          "User-Agent": "ReadMyCode-App",
          Accept: "application/vnd.github+json",
        },
      });
      if (!ghRes.ok) {
        return res.status(401).json({ message: "Invalid or expired GitHub token" });
      }
      ghUser = await ghRes.json();

      // If user's email is private on GitHub, fetch from /user/emails
      if (!ghUser.email) {
        try {
          const emailsRes = await fetch("https://api.github.com/user/emails", {
            headers: {
              Authorization: `Bearer ${ghToken}`,
              "User-Agent": "ReadMyCode-App",
              Accept: "application/vnd.github+json",
            },
          });
          if (emailsRes.ok) {
            const emails = await emailsRes.json();
            const primary = emails.find((e) => e.primary && e.verified) || emails[0];
            if (primary) ghUser.email = primary.email;
          }
        } catch (emailErr) {
          logger.warn(`Failed to fetch GitHub user emails: ${emailErr.message}`);
        }
      }
    } else if (inputUsername) {
      const ghRes = await fetch(`https://api.github.com/users/${inputUsername}`, {
        headers: {
          "User-Agent": "ReadMyCode-App",
          Accept: "application/vnd.github+json",
        },
      });
      if (!ghRes.ok) {
        return res.status(404).json({ message: `GitHub user '${inputUsername}' not found` });
      }
      ghUser = await ghRes.json();
    } else {
      return res.status(400).json({ message: "GitHub code, personal access token, or username is required" });
    }

    const githubId = String(ghUser.id);
    const githubUsername = ghUser.login;
    const email = ghUser.email ? ghUser.email.toLowerCase() : `${ghUser.login.toLowerCase()}@users.noreply.github.com`;
    const name = ghUser.name || ghUser.login;
    const avatar = ghUser.avatar_url || "";

    let user;
    if (isDbConnected()) {
      if (req.user && req.user._id && req.user._id !== "demo_guest") {
        user = await User.findById(req.user._id);
      }
      if (!user) {
        user = await User.findOne({
          $or: [{ githubId }, { email }, { githubUsername }],
        });
      }

      if (user) {
        user.githubId = githubId;
        user.githubUsername = githubUsername;
        if (avatar) user.avatar = avatar;
        if (ghToken) user.githubToken = ghToken;
        await user.save();
      } else {
        const randomPass = crypto.randomBytes(16).toString("hex");
        user = await User.create({
          name,
          email,
          password: randomPass,
          githubId,
          githubUsername,
          avatar,
          githubToken: ghToken || null,
        });
      }
    } else {
      user = memoryStore.findUserByEmail(email);
      if (user) {
        user.githubUsername = githubUsername;
        user.avatar = avatar;
        if (ghToken) user.githubToken = ghToken;
        memoryStore.saveStore();
      } else {
        user = await memoryStore.createUser({
          name,
          email,
          password: crypto.randomBytes(16).toString("hex"),
        });
        user.githubUsername = githubUsername;
        user.avatar = avatar;
        if (ghToken) user.githubToken = ghToken;
        memoryStore.saveStore();
      }
    }

    const token = signToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || avatar,
        githubUsername: user.githubUsername,
        hasGithubToken: Boolean(user.githubToken || ghToken),
      },
      message: `Welcome, ${user.name}! Connected to GitHub.`,
    });
  } catch (err) {
    logger.error(`githubAuth failed: ${err.message}`);
    next(err);
  }
}

function getGithubConfig(req, res) {
  const clientId = GITHUB_CLIENT_ID || process.env.GITHUB_CLIENT_ID || "";
  res.json({
    clientId,
    isConfigured: Boolean(clientId),
  });
}

async function getUserGithubRepos(req, res, next) {
  try {
    const userDoc = isDbConnected()
      ? await User.findById(req.user._id).select("+githubToken")
      : await memoryStore.findUserById(req.user._id);

    const token = req.query.token || userDoc?.githubToken || req.user?.githubToken || process.env.GITHUB_TOKEN;
    const username =
      req.query.username ||
      userDoc?.githubUsername ||
      req.user?.githubUsername ||
      (req.user?.email && req.user.email.includes("@users.noreply.github.com")
        ? req.user.email.split("@")[0]
        : null);

    let apiUrl = "";
    const headers = {
      "User-Agent": "ReadMyCode-App",
      Accept: "application/vnd.github+json",
    };

    if (token && !/^_+$/.test(token)) {
      headers.Authorization = `Bearer ${token}`;
      apiUrl = "https://api.github.com/user/repos?sort=updated&per_page=100&affiliation=owner,collaborator";
    } else if (username) {
      apiUrl = `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`;
    } else {
      return res.status(400).json({
        message: "No GitHub account connected. Please connect your GitHub account to import repositories.",
        needConnect: true,
      });
    }

    const ghRes = await fetch(apiUrl, { headers });
    if (!ghRes.ok) {
      const errText = await ghRes.text();
      return res.status(ghRes.status).json({
        message: `Failed to fetch repositories from GitHub (${ghRes.status}): ${errText}`,
      });
    }

    const rawRepos = await ghRes.json();
    if (!Array.isArray(rawRepos)) {
      return res.json({ repos: [], total: 0, username: username || "" });
    }

    const repos = rawRepos.map((r) => ({
      id: r.id,
      name: r.name,
      fullName: r.full_name,
      owner: r.owner?.login || username,
      avatarUrl: r.owner?.avatar_url || "",
      description: r.description || "No description provided",
      url: r.html_url,
      cloneUrl: r.clone_url,
      isPrivate: Boolean(r.private),
      defaultBranch: r.default_branch || "main",
      language: r.language || "Codebase",
      stars: r.stargazers_count || 0,
      forks: r.forks_count || 0,
      updatedAt: r.updated_at,
      pushedAt: r.pushed_at,
    }));

    res.json({
      repos,
      total: repos.length,
      username: username || (userDoc ? userDoc.githubUsername : ""),
    });
  } catch (err) {
    logger.error(`getUserGithubRepos failed: ${err.message}`);
    next(err);
  }
}

module.exports = {
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
};