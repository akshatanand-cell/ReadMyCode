const fs = require("fs");
const path = require("path");

// Directories we never want to walk into (build artifacts, deps, vcs)
const IGNORE_DIRS = new Set([
  "node_modules", ".git", "dist", "build", ".next", "coverage",
  "temp_repos", ".vscode", ".idea", "__pycache__", "venv",
]);

// Extensions we care about for code analysis
const CODE_EXTENSIONS = new Set([
  ".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs",
  ".py", ".java", ".go", ".rb", ".php", ".css", ".json", ".md",
]);

const MAX_FILE_SIZE = 500 * 1024; // 500KB - skip huge generated files
const MAX_TOTAL_FILES = 400; // safety cap for hackathon demo repos

/**
 * Recursively walks a repo directory and returns file metadata + content
 * for files that matter to analysis (code, config, docs).
 */
function walkRepo(rootDir, { onlyCode = false } = {}) {
  const results = [];

  function walk(dir) {
    if (results.length >= MAX_TOTAL_FILES) return;
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (err) {
      return;
    }

    for (const entry of entries) {
      if (results.length >= MAX_TOTAL_FILES) return;
      const fullPath = path.join(dir, entry.name);
      const relPath = path.relative(rootDir, fullPath);

      if (entry.isDirectory()) {
        if (IGNORE_DIRS.has(entry.name) || entry.name.startsWith(".")) continue;
        walk(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (onlyCode && !CODE_EXTENSIONS.has(ext)) continue;

        let stat;
        try {
          stat = fs.statSync(fullPath);
        } catch {
          continue;
        }
        if (stat.size > MAX_FILE_SIZE) continue;

        let content = "";
        try {
          content = fs.readFileSync(fullPath, "utf-8");
        } catch {
          continue; // binary or unreadable file
        }

        results.push({
          path: relPath,
          extension: ext,
          size: stat.size,
          content,
        });
      }
    }
  }

  walk(rootDir);
  return results;
}

/** Returns just the folder/file tree as a nested structure (no file contents) */
function getTree(rootDir) {
  function build(dir) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return [];
    }
    return entries
      .filter((e) => !IGNORE_DIRS.has(e.name) && !e.name.startsWith("."))
      .map((e) => {
        const fullPath = path.join(dir, e.name);
        if (e.isDirectory()) {
          return { name: e.name, type: "dir", children: build(fullPath) };
        }
        return { name: e.name, type: "file" };
      });
  }
  return build(rootDir);
}

module.exports = { walkRepo, getTree, IGNORE_DIRS, CODE_EXTENSIONS };
