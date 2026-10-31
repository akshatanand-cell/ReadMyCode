#!/usr/bin/env node

/**
 * ReadMyCode Action Runner
 * Automatically generates production-grade specifications for codebases in GitHub Actions.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const workspaceDir = process.env.GITHUB_WORKSPACE || process.cwd();
const outputDir = path.resolve(workspaceDir, process.env.INPUT_OUTPUT_DIR || '.');

console.log('🚀 Running ReadMyCode Auto-Documentation Action...');
console.log(`📁 Scanning directory: ${workspaceDir}`);
console.log(`📝 Output directory: ${outputDir}`);

// Excluded paths
const IGNORED_DIRS = new Set([
  'node_modules',
  '.git',
  '.github',
  'dist',
  'build',
  'coverage',
  '.next',
  '.turbo',
  'venv',
  '__pycache__',
]);

function walkDirectory(dir, fileList = [], maxDepth = 4, currentDepth = 0) {
  if (currentDepth > maxDepth) return fileList;
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (IGNORED_DIRS.has(entry.name) || entry.name.startsWith('.')) continue;
      const fullPath = path.join(dir, entry.name);
      const relPath = path.relative(workspaceDir, fullPath).replace(/\\/g, '/');

      if (entry.isDirectory()) {
        walkDirectory(fullPath, fileList, maxDepth, currentDepth + 1);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        let content = '';
        try {
          const stats = fs.statSync(fullPath);
          if (stats.size < 50000) {
            content = fs.readFileSync(fullPath, 'utf8');
          }
        } catch {
          // Ignore unreadable files
        }
        fileList.push({ path: relPath, extension: ext, content });
      }
    }
  } catch (err) {
    console.warn(`Warning reading dir ${dir}: ${err.message}`);
  }
  return fileList;
}

const files = walkDirectory(workspaceDir);
console.log(`🔍 Discovered ${files.length} code and configuration files.`);

const repoName = process.env.GITHUB_REPOSITORY
  ? process.env.GITHUB_REPOSITORY.split('/')[1]
  : path.basename(workspaceDir);

// Detect languages
const extensions = new Set(files.map((f) => f.extension.toLowerCase()));
const hasJS = extensions.has('.js') || extensions.has('.jsx') || extensions.has('.ts') || extensions.has('.tsx');
const hasPython = extensions.has('.py');
const hasRust = extensions.has('.rs');
const hasGo = extensions.has('.go');
const hasJava = extensions.has('.java');

let stack = 'General';
if (hasJS && hasPython) stack = 'Full-Stack (JavaScript/TypeScript + Python)';
else if (hasJS) stack = 'JavaScript / TypeScript';
else if (hasPython) stack = 'Python';
else if (hasRust) stack = 'Rust';
else if (hasGo) stack = 'Go';
else if (hasJava) stack = 'Java';

// 1. Generate ARCHITECTURE.md
const archPath = path.join(outputDir, 'ARCHITECTURE.md');
if (!fs.existsSync(archPath)) {
  const archContent = `# ${repoName} — Architecture & System Map

> Generated automatically by [ReadMyCode](https://readmycode.vercel.app)

## Technology Stack
- **Primary Language & Runtime**: ${stack}
- **Monitored Source Files**: ${files.length} indexed files

## System Topology

\`\`\`mermaid
flowchart TD
  Client["Client / Entry Points"] --> Routing["Route & Request Handlers"]
  Routing --> Services["Core Business Services"]
  Services --> Storage["State / Persistence / Models"]
\`\`\`

## Directory Organization
\`\`\`text
${files.slice(0, 30).map((f) => f.path).join('\n')}
${files.length > 30 ? `... and ${files.length - 30} other source files` : ''}
\`\`\`
`;
  fs.writeFileSync(archPath, archContent, 'utf8');
  console.log(`✅ Generated ${archPath}`);
}

// 2. Generate AGENTS.md
const agentsPath = path.join(outputDir, 'AGENTS.md');
if (!fs.existsSync(agentsPath)) {
  const agentsContent = `# ${repoName} — AI Agent Constitution & Behavioral Rules

## Mission Statement
This document defines operational constraints, code generation protocols, and safety rules for autonomous AI agents contributing to ${repoName}.

## General Rules
1. **Preserve Documentation**: Never remove existing comments, docstrings, or legal notices without explicit instruction.
2. **Security**: Never commit secrets, tokens, or plaintext credentials. Use environment variables.
3. **Verification**: Always run linting and type/unit test checks prior to concluding modifications.
`;
  fs.writeFileSync(agentsPath, agentsContent, 'utf8');
  console.log(`✅ Generated ${agentsPath}`);
}

console.log('🎉 ReadMyCode specification run completed successfully!');
