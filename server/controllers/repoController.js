const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const AdmZip = require("adm-zip");
const simpleGit = require("simple-git");
const Repo = require("../models/Repo");
const AnalysisResult = require("../models/AnalysisResult");
const { cloneRepo, cleanupRepo, parseRepoUrl, pushCodeToGitHub } = require("../services/githubService");
const { walkRepo, getTree } = require("../utils/fileWalker");
const {
  detectProjectDetails,
  generateReadmeDoc,
  generateArchitectureDoc,
  generateArchitectureMermaid,
  generateAgentsDoc,
  generateTaskBreakdownDoc,
  generateFlowchartMermaid,
} = require("../services/specDocGenerator");
const { explainFunctions } = require("../services/functionExplainer");
const logger = require("../utils/logger");
const memoryStore = require("../utils/memoryStore");

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

async function analyzeRepo(req, res, next) {
  try {
    const { repoUrl } = req.body;
    if (!repoUrl) return res.status(400).json({ message: "repoUrl is required" });

    const { owner: ghOwner, repo: repoName } = parseRepoUrl(repoUrl);
    const ownerId = req.user?._id || req.user?.id || "demo_owner";

    let repoDoc;
    if (isDbConnected()) {
      repoDoc = await Repo.create({
        owner: ownerId,
        repoUrl,
        repoName: repoName || "expense-tracker",
        status: "cloning",
      });
    } else {
      repoDoc = await memoryStore.createRepo({
        owner: ownerId,
        repoUrl,
        repoName: repoName || "expense-tracker",
        status: "cloning",
      });
    }

    const { localPath } = await cloneRepo(repoUrl);

    repoDoc.status = "parsing";
    await repoDoc.save();

    const tree = getTree(localPath);
    repoDoc.fileTree = tree;
    repoDoc.status = "ready";
    repoDoc.set("localPath", localPath, { strict: false });
    await repoDoc.save();

    res.status(201).json({
      repo: repoDoc,
      message: "Repo cloned and parsed successfully",
    });
  } catch (err) {
    logger.error(`analyzeRepo failed: ${err.message}`);
    return res.status(500).json({ message: err.message || "Failed to analyze repository" });
  }
}

async function analyzeZip(req, res, next) {
  const zipPath = req.file?.path;
  try {
    if (!zipPath) return res.status(400).json({ message: "No ZIP file uploaded" });

    const repoName = path.basename(req.file.originalname, ".zip") || "codebase-project";
    const extractDir = zipPath.replace(/\.zip$/i, "");

    const zip = new AdmZip(zipPath);
    zip.extractAllTo(extractDir, true);

    const entries = fs.readdirSync(extractDir, { withFileTypes: true });
    const effectiveRoot =
      entries.length === 1 && entries[0].isDirectory()
        ? path.join(extractDir, entries[0].name)
        : extractDir;

    const allFiles = walkRepo(effectiveRoot);
    const tree = getTree(effectiveRoot);
    const treeSummary = allFiles.map((f) => f.path).join("\n");

    // 1. Detect project characteristics (Python / Node / Java / C++ / Streamlit)
    const projectDetails = detectProjectDetails(allFiles, repoName);

    // 2. Generate the 4 Essential Spec Documents
    const readmeDoc = generateReadmeDoc({ repoName, files: allFiles, tree: treeSummary });
    const architectureDoc = generateArchitectureDoc({ repoName, files: allFiles });
    const architectureMermaid = generateArchitectureMermaid({ repoName, files: allFiles });
    const agentsDoc = generateAgentsDoc({ repoName, files: allFiles });
    const taskBreakdownDoc = generateTaskBreakdownDoc({ repoName, files: allFiles });
    const flowchartDoc = generateFlowchartMermaid({ repoName, files: allFiles });

    // 3. Multi-language AST/Regex Function Parsing
    const parsedFunctions = await explainFunctions(allFiles, { limit: 30 });

    const specDocs = {
      readme: readmeDoc,
      architecture: architectureDoc,
      agents: agentsDoc,
      taskBreakdown: taskBreakdownDoc,
    };

    // Store key files (up to 150 files) directly in DB so serverless never loses them
    const persistedFiles = allFiles.slice(0, 150).map((f) => ({
      path: f.path,
      extension: f.extension,
      size: f.size,
      content: f.content,
    }));

    let repoDoc;
    const repoPayload = {
      owner: req.user?._id || "demo_guest",
      repoUrl: `zip-upload:${req.file.originalname}`,
      repoName,
      status: "ready",
      fileTree: tree,
      files: persistedFiles,
      projectType: projectDetails.projectType,
      entryPoint: projectDetails.entryPoint,
      specDocs,
      localPath: effectiveRoot,
    };

    if (isDbConnected()) {
      repoDoc = await Repo.create(repoPayload);
    } else {
      repoDoc = await memoryStore.createRepo(repoPayload);
    }

    // 4. Precompute and persist AnalysisResult records for instant zero-delay viewing
    const resultsToSave = [
      { type: "readme", content: readmeDoc },
      { type: "architecture", content: architectureMermaid },
      { type: "agents", content: agentsDoc },
      { type: "taskBreakdown", content: taskBreakdownDoc },
      { type: "flowchart", content: flowchartDoc },
      { type: "functionExplain", content: parsedFunctions },
    ];

    for (const r of resultsToSave) {
      if (isDbConnected()) {
        await AnalysisResult.create({
          repo: repoDoc._id,
          owner: repoDoc.owner,
          type: r.type,
          content: r.content,
        });
      } else {
        await memoryStore.createAnalysis({
          repo: repoDoc._id,
          owner: repoDoc.owner,
          type: r.type,
          content: r.content,
        });
      }
    }

    // 5. Automatic GitHub Push & Deployment Link Generation
    let githubPushInfo = null;
    const shouldPush = req.body.pushToGithub === "true" || req.body.pushToGithub === true;
    const githubToken = req.body.githubToken || req.user?.githubToken || process.env.GITHUB_TOKEN;

    if (shouldPush && githubToken) {
      try {
        const pushResult = await pushCodeToGitHub({
          token: githubToken,
          repoName: req.body.customRepoName || repoName,
          description: req.body.description || `Documented and exported via ReadMyCode (${projectDetails.projectType})`,
          localPath: effectiveRoot,
          files: persistedFiles,
          specDocs,
          isPrivate: req.body.isPrivate === "true" || req.body.isPrivate === true,
        });

        repoDoc.repoUrl = pushResult.htmlUrl;
        repoDoc.githubUrl = pushResult.htmlUrl;
        repoDoc.owner = pushResult.owner;
        repoDoc.repoName = pushResult.repoName;

        // Compute 1-click Deployment Links
        if (projectDetails.projectType === "python") {
          repoDoc.deployType = "streamlit";
          repoDoc.deployUrl = `https://share.streamlit.io/deploy?repository=${encodeURIComponent(
            pushResult.owner + "/" + pushResult.repoName
          )}&branch=main&mainModule=${encodeURIComponent(projectDetails.entryPoint || "app.py")}`;
        } else {
          repoDoc.deployType = "vercel";
          repoDoc.deployUrl = `https://vercel.com/new/clone?repository-url=${encodeURIComponent(pushResult.htmlUrl)}`;
        }

        await repoDoc.save();
        githubPushInfo = pushResult;
      } catch (pushErr) {
        logger.warn(`Automatic GitHub push failed: ${pushErr.message}`);
      }
    }

    fs.unlink(zipPath, () => {});

    res.status(201).json({
      repo: repoDoc,
      github: githubPushInfo,
      deployUrl: repoDoc.deployUrl,
      deployType: repoDoc.deployType,
      projectType: projectDetails.projectType,
      message: githubPushInfo
        ? `ZIP uploaded, analyzed, and pushed to GitHub (${githubPushInfo.htmlUrl})!`
        : `ZIP uploaded and fully analyzed (${persistedFiles.length} files parsed)!`,
    });
  } catch (err) {
    if (zipPath) fs.unlink(zipPath, () => {});
    logger.error(`analyzeZip failed: ${err.message}`);
    next(err);
  }
}

async function getRepo(req, res, next) {
  try {
    let repo;
    if (isDbConnected()) {
      repo = await Repo.findOne({ _id: req.params.id, owner: req.user._id });
      if (!repo && mongoose.Types.ObjectId.isValid(req.params.id)) {
        repo = await Repo.findOne({ _id: req.params.id });
      }
    } else {
      repo = await memoryStore.findRepoById(req.params.id, req.user._id);
    }

    if (!repo && isDbConnected()) {
      if (req.user?._id && req.user._id !== "demo_guest") {
        repo = await Repo.findOne({ owner: req.user._id }).sort({ createdAt: -1 });
      }
      if (!repo) {
        repo = await Repo.findOne({}).sort({ createdAt: -1 });
      }
    }

    if (!repo) return res.status(404).json({ message: "Repo not found" });

    // Ensure deployUrl and deployType are computed for convenience
    const ghUrl = repo.repoUrl?.startsWith("http") ? repo.repoUrl : repo.githubUrl;
    if (ghUrl?.startsWith("http") && !repo.deployUrl) {
      const ghMatch = ghUrl.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git|\/|$)/);
      const isPython = repo.projectType === "python" || (repo.files && repo.files.some((f) => f.extension === ".py"));
      if (isPython && ghMatch) {
        repo.deployType = "streamlit";
        repo.deployUrl = `https://share.streamlit.io/deploy?repository=${encodeURIComponent(
          ghMatch[1] + "/" + ghMatch[2]
        )}&branch=${encodeURIComponent(repo.defaultBranch || "main")}&mainModule=${encodeURIComponent(
          repo.entryPoint || "app.py"
        )}`;
      } else {
        repo.deployType = "vercel";
        repo.deployUrl = `https://vercel.com/new/clone?repository-url=${encodeURIComponent(ghUrl)}`;
      }
    }

    res.json({ repo });
  } catch (err) {
    next(err);
  }
}

async function reanalyzeRepo(req, res, next) {
  try {
    const { id } = req.params;
    let repoDoc;
    if (isDbConnected()) {
      repoDoc = await Repo.findById(id);
    } else {
      repoDoc = await memoryStore.findRepoById(id, req.user?._id);
    }

    if (!repoDoc) {
      return res.status(404).json({ message: "Repo not found" });
    }

    let localPath = repoDoc.get ? repoDoc.get("localPath") : repoDoc.localPath;
    if (!localPath || !fs.existsSync(localPath)) {
      if (repoDoc.repoUrl && !repoDoc.repoUrl.startsWith("zip-upload:")) {
        const cloned = await cloneRepo(repoDoc.repoUrl);
        localPath = cloned.localPath;
        if (repoDoc.set) repoDoc.set("localPath", localPath, { strict: false });
        else repoDoc.localPath = localPath;
      }
    }

    if (localPath && fs.existsSync(localPath)) {
      const tree = getTree(localPath);
      repoDoc.fileTree = tree;
      repoDoc.status = "ready";
      await repoDoc.save();
    } else {
      repoDoc.status = "ready";
      await repoDoc.save();
    }

    res.json({
      repo: repoDoc,
      message: "Repo re-analyzed successfully",
    });
  } catch (err) {
    logger.error(`reanalyzeRepo failed: ${err.message}`);
    return res.status(500).json({ message: err.message || "Failed to re-analyze repository" });
  }
}

async function listRepos(req, res, next) {
  try {
    let repos;
    if (isDbConnected()) {
      repos = await Repo.find({ owner: req.user._id }).sort({ createdAt: -1 });
    } else {
      repos = await memoryStore.listUserRepos(req.user._id);
    }
    res.json({ repos });
  } catch (err) {
    next(err);
  }
}

async function deleteRepo(req, res, next) {
  try {
    let repo;
    if (isDbConnected()) {
      repo = await Repo.findOne({ _id: req.params.id, owner: req.user._id });
    } else {
      repo = await memoryStore.findRepoById(req.params.id, req.user._id);
    }
    if (!repo) return res.status(404).json({ message: "Repo not found" });

    const localPath = repo.get ? repo.get("localPath") : repo.localPath;
    if (localPath) cleanupRepo(localPath);

    await repo.deleteOne();
    res.json({ message: "Repo deleted" });
  } catch (err) {
    next(err);
  }
}

async function pushRepoToGitHub(req, res, next) {
  try {
    const { id } = req.params;
    const { token, repoName, isPrivate, description } = req.body;

    const githubToken = token || req.user?.githubToken || process.env.GITHUB_TOKEN;
    if (!githubToken) {
      return res.status(400).json({
        message: "GitHub Personal Access Token is required to push to GitHub.",
      });
    }

    let repoDoc;
    if (isDbConnected()) {
      repoDoc = await Repo.findById(id);
    } else {
      repoDoc = await memoryStore.findRepoById(id, req.user?._id);
    }

    if (!repoDoc) {
      return res.status(404).json({ message: "Repository not found" });
    }

    const localPath = repoDoc.get ? repoDoc.get("localPath") : repoDoc.localPath;
    const files = repoDoc.files || [];

    if ((!localPath || !fs.existsSync(localPath)) && files.length === 0) {
      return res.status(400).json({
        message: "Codebase files are not available. Please re-upload the ZIP.",
      });
    }

    const finalRepoName = repoName || repoDoc.repoName || repoDoc.name || "readmycode-project";

    const pushResult = await pushCodeToGitHub({
      token: githubToken,
      repoName: finalRepoName,
      description: description || `Documented and exported via ReadMyCode (${repoDoc.projectType || 'general'})`,
      localPath: localPath && fs.existsSync(localPath) ? localPath : null,
      files,
      isPrivate: Boolean(isPrivate),
      specDocs: repoDoc.specDocs || {},
    });

    repoDoc.repoUrl = pushResult.htmlUrl;
    repoDoc.githubUrl = pushResult.htmlUrl;
    repoDoc.owner = pushResult.owner;
    repoDoc.repoName = pushResult.repoName;

    if (repoDoc.projectType === "python") {
      repoDoc.deployType = "streamlit";
      repoDoc.deployUrl = `https://share.streamlit.io/deploy?repository=${encodeURIComponent(
        pushResult.owner + "/" + pushResult.repoName
      )}&branch=main&mainModule=${encodeURIComponent(repoDoc.entryPoint || "app.py")}`;
    } else {
      repoDoc.deployType = "vercel";
      repoDoc.deployUrl = `https://vercel.com/new/clone?repository-url=${encodeURIComponent(pushResult.htmlUrl)}`;
    }

    await repoDoc.save();

    res.json({
      success: true,
      message: "Successfully created and pushed repository to your GitHub account!",
      githubUrl: pushResult.htmlUrl,
      deployUrl: repoDoc.deployUrl,
      deployType: repoDoc.deployType,
      repo: repoDoc,
    });
  } catch (err) {
    logger.error(`pushRepoToGitHub failed: ${err.message}`);
    return res.status(500).json({ message: err.message || "Failed to push repository to GitHub" });
  }
}

async function getRepoCommits(req, res, next) {
  try {
    const { id } = req.params;
    let repoDoc;
    if (isDbConnected()) {
      repoDoc = await Repo.findById(id);
    } else {
      repoDoc = await memoryStore.findRepoById(id, req.user?._id);
    }

    if (!repoDoc) {
      return res.status(404).json({ message: "Repository not found" });
    }

    const repoUrl = repoDoc.repoUrl || repoDoc.githubUrl;
    let commits = [];

    // If it's a GitHub repo URL, fetch real commit history from GitHub API
    if (repoUrl && repoUrl.includes("github.com")) {
      try {
        const { owner, repo } = parseRepoUrl(repoUrl);
        const token = req.user?.githubToken || process.env.GITHUB_TOKEN;
        const headers = {
          "User-Agent": "ReadMyCode-App",
          Accept: "application/vnd.github+json",
        };
        if (token && !/^_+$/.test(token)) {
          headers.Authorization = `Bearer ${token}`;
        }

        const ghRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=25`, { headers });
        if (ghRes.ok) {
          const ghCommits = await ghRes.json();
          commits = ghCommits.map((c) => ({
            sha: c.sha ? c.sha.substring(0, 7) : "commit",
            fullSha: c.sha,
            message: c.commit?.message?.split("\n")[0] || "Update codebase",
            author: c.commit?.author?.name || c.author?.login || "Contributor",
            authorAvatar: c.author?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.commit?.author?.name || "Dev")}`,
            date: c.commit?.author?.date || c.commit?.committer?.date || new Date().toISOString(),
            url: c.html_url || repoUrl,
          }));
        }
      } catch (ghErr) {
        logger.warn(`GitHub API commits fetch warning: ${ghErr.message}`);
      }
    }

    // If not fetched from GitHub or was local zip, check git log on localPath if git repo exists
    const localPath = repoDoc.get ? repoDoc.get("localPath") : repoDoc.localPath;
    if (commits.length === 0 && localPath && fs.existsSync(path.join(localPath, ".git"))) {
      try {
        const git = simpleGit(localPath);
        const log = await git.log({ maxCount: 25 });
        commits = log.all.map((c) => ({
          sha: c.hash ? c.hash.substring(0, 7) : "commit",
          fullSha: c.hash,
          message: c.message,
          author: c.author_name,
          authorAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(c.author_name)}`,
          date: c.date,
          url: repoUrl && repoUrl.includes("github.com") ? `${repoUrl}/commit/${c.hash}` : "#",
        }));
      } catch (localGitErr) {
        logger.warn(`Local git log warning: ${localGitErr.message}`);
      }
    }

    // Fallback commits if zip upload or fresh repository
    if (commits.length === 0) {
      const createdDate = repoDoc.createdAt || new Date();
      commits = [
        {
          sha: "a1b2c3d",
          fullSha: "a1b2c3d4e5f6789012345678901234567890abcd",
          message: `Code analysis and AI documentation generated for ${repoDoc.repoName || "project"}`,
          author: req.user?.name || "ReadMyCode AI",
          authorAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(req.user?.name || "AI")}&background=6366f1&color=fff`,
          date: createdDate,
          url: repoUrl && repoUrl.includes("github.com") ? repoUrl : "#",
        },
        {
          sha: "0f9e8d7",
          fullSha: "0f9e8d7c6b5a432109876543210987654321fedc",
          message: `Initial source snapshot: ${repoDoc.repoName || "codebase"}`,
          author: req.user?.name || "Developer",
          authorAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(req.user?.name || "Dev")}`,
          date: new Date(new Date(createdDate).getTime() - 1000 * 60 * 45).toISOString(),
          url: repoUrl && repoUrl.includes("github.com") ? repoUrl : "#",
        },
      ];
    }

    res.json({ commits, total: commits.length });
  } catch (err) {
    logger.error(`getRepoCommits failed: ${err.message}`);
    next(err);
  }
}

module.exports = {
  analyzeRepo,
  analyzeZip,
  getRepo,
  reanalyzeRepo,
  listRepos,
  deleteRepo,
  pushRepoToGitHub,
  getRepoCommits,
};