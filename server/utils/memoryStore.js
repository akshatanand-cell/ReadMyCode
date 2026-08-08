const bcrypt = require("bcryptjs");

const memoryDb = {
  users: new Map(),
  repos: new Map(),
  analysisResults: [],
};

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

async function createUser({ name, email, password }) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const _id = "mem_user_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
  const user = {
    _id,
    name,
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    createdAt: new Date(),
    comparePassword: async function (candidatePassword) {
      return bcrypt.compare(candidatePassword, this.password);
    },
  };
  memoryDb.users.set(_id, user);
  return user;
}

async function createRepo({ owner, repoUrl, repoName, status }) {
  const _id = "mem_repo_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
  const repo = {
    _id,
    owner: String(owner),
    repoUrl,
    repoName,
    name: repoName,
    status: status || "ready",
    fileTree: [],
    localPath: null,
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
      return this;
    },
    deleteOne: async function () {
      memoryDb.repos.delete(this._id);
    },
  };
  memoryDb.repos.set(_id, repo);
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
    if (String(repo.owner) === String(ownerId)) list.push(repo);
  }
  return list.sort((a, b) => b.createdAt - a.createdAt);
}

async function createAnalysis({ repo, owner, type, content, meta }) {
  const _id = "mem_analysis_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
  const record = { _id, repo, owner: String(owner), type, content, meta, createdAt: new Date() };
  memoryDb.analysisResults.push(record);
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
};
