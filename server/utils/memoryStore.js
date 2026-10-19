const fs = require("fs");
const path = require("path");
const os = require("os");
const bcrypt = require("bcryptjs");

const STORAGE_FILE = process.env.PERSISTENT_STORE_PATH || path.join(os.tmpdir(), "readmycode_store.json");

const memoryDb = {
  users: new Map(),
  repos: new Map(),
  analysisResults: [],
};

// Rehydrate from persistent disk cache if present
function loadStore() {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const raw = fs.readFileSync(STORAGE_FILE, "utf-8");
      const data = JSON.parse(raw);
      if (Array.isArray(data.users)) {
        for (const u of data.users) {
          u.comparePassword = async function (candidatePassword) {
            return bcrypt.compare(candidatePassword, this.password);
          };
          u.compareSecurityAnswer = async function (candidateAnswer) {
            if (!this.securityAnswer || !candidateAnswer) return false;
            return bcrypt.compare(candidateAnswer.toLowerCase().trim(), this.securityAnswer);
          };
          memoryDb.users.set(String(u._id), u);
        }
      }
      if (Array.isArray(data.repos)) {
        for (const r of data.repos) {
          r.get = function (key) { return this[key]; };
          r.set = function (key, val) { this[key] = val; };
          r.save = async function () { this.updatedAt = new Date(); saveStore(); return this; };
          r.deleteOne = async function () { memoryDb.repos.delete(this._id); saveStore(); };
          memoryDb.repos.set(String(r._id), r);
        }
      }
      if (Array.isArray(data.analysisResults)) {
        memoryDb.analysisResults = data.analysisResults;
      }
    }
  } catch (err) {
    console.warn(`[memoryStore] Load storage warning: ${err.message}`);
  }
}

function saveStore() {
  try {
    const data = {
      users: Array.from(memoryDb.users.values()).map(u => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        password: u.password,
        githubToken: u.githubToken || null,
        githubUsername: u.githubUsername || null,
        securityQuestion: u.securityQuestion || null,
        securityAnswer: u.securityAnswer || null,
        createdAt: u.createdAt,
      })),
      repos: Array.from(memoryDb.repos.values()),
      analysisResults: memoryDb.analysisResults,
    };
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.warn(`[memoryStore] Save storage warning: ${err.message}`);
  }
}

// Initial load
loadStore();

async function findUserByEmail(email) {
  if (!email) return null;
  const target = email.toLowerCase().trim();
  for (const user of memoryDb.users.values()) {
    if (user.email.toLowerCase().trim() === target) return user;
  }
  return null;
}

async function findUserById(id) {
  if (!id) return null;
  return memoryDb.users.get(String(id)) || null;
}

async function createUser({ name, email, password, githubToken, githubUsername, securityQuestion, securityAnswer }) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  let hashedSecurityAnswer = null;
  if (securityAnswer) {
    hashedSecurityAnswer = await bcrypt.hash(securityAnswer.toLowerCase().trim(), salt);
  }
  const _id = "mem_user_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
  const user = {
    _id,
    name,
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    githubToken: githubToken || null,
    githubUsername: githubUsername || null,
    securityQuestion: securityQuestion || null,
    securityAnswer: hashedSecurityAnswer,
    createdAt: new Date(),
    comparePassword: async function (candidatePassword) {
      return bcrypt.compare(candidatePassword, this.password);
    },
    compareSecurityAnswer: async function (candidateAnswer) {
      if (!this.securityAnswer || !candidateAnswer) return false;
      return bcrypt.compare(candidateAnswer.toLowerCase().trim(), this.securityAnswer);
    },
  };
  memoryDb.users.set(_id, user);
  saveStore();
  return user;
}

async function createRepo({ owner, repoUrl, repoName, status, localPath, fileTree }) {
  const _id = "mem_repo_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
  const repo = {
    _id,
    owner: String(owner),
    repoUrl,
    repoName,
    name: repoName,
    status: status || "ready",
    fileTree: fileTree || [],
    localPath: localPath || null,
    createdAt: new Date(),
    updatedAt: new Date(),
    get: function (key) {
      return this[key];
    },
    set: function (key, val) {
      this[key] = val;
    },
    save: async function () {
      this.updatedAt = new Date();
      saveStore();
      return this;
    },
    deleteOne: async function () {
      memoryDb.repos.delete(this._id);
      saveStore();
    },
  };
  memoryDb.repos.set(_id, repo);
  saveStore();
  return repo;
}

async function findRepoById(id, ownerId) {
  let repo = memoryDb.repos.get(String(id));
  if (!repo && memoryDb.repos.size > 0) {
    repo = Array.from(memoryDb.repos.values()).pop();
  }
  return repo || null;
}

async function listUserRepos(ownerId) {
  const list = [];
  for (const repo of memoryDb.repos.values()) {
    if (String(repo.owner) === String(ownerId) || String(ownerId) === "demo_guest") {
      list.push(repo);
    }
  }
  return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function createAnalysis({ repo, owner, type, content, meta }) {
  const _id = "mem_analysis_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
  const record = { _id, repo, owner: String(owner), type, content, meta, createdAt: new Date() };
  memoryDb.analysisResults.push(record);
  saveStore();
  return record;
}

async function findAnalysis(repoId, type) {
  const matches = memoryDb.analysisResults.filter(
    (a) => String(a.repo) === String(repoId) && a.type === type
  );
  return matches.length > 0 ? matches[matches.length - 1] : null;
}

module.exports = {
  memoryDb,
  findUserByEmail,
  findUserById,
  createUser,
  createRepo,
  findRepoById,
  listUserRepos,
  createAnalysis,
  findAnalysis,
  saveStore,
};
