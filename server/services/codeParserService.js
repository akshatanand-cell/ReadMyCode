const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const path = require("path");
const logger = require("../utils/logger");

const PARSE_OPTS = {
  sourceType: "unambiguous",
  plugins: ["jsx", "typescript", "classProperties", "objectRestSpread", "optionalChaining"],
  errorRecovery: true,
};

function estimateComplexity(code = "") {
  const loops = (code.match(/\b(for|while)\b/g) || []).length;
  const conditionals = (code.match(/\b(if|elif|else if|case)\b/g) || []).length;
  const recursions = (code.match(/\b[a-zA-Z0-9_]+\s*\(/g) || []).length;

  if (loops >= 2) return "O(N^2)";
  if (loops === 1) return conditionals >= 2 ? "O(N log N)" : "O(N)";
  if (recursions > 5) return "O(2^N)";
  return "O(1)";
}

/**
 * Parses Python files using regex and syntax pattern matching
 */
function parsePythonFile(filePath, content) {
  const result = { filePath, functions: [], classes: [], imports: [], exports: [], parseError: null };
  const lines = content.split("\n");

  const fnRegex = /^(?:[ \t]*)(?:async\s+)?def\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)(?:\s*->\s*([^:]+))?:/m;
  const classRegex = /^(?:[ \t]*)class\s+([a-zA-Z0-9_]+)(?:\(([^)]*)\))?:/m;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect imports
    if (/^\s*(import\s+|from\s+)/.test(line)) {
      result.imports.push(line.trim());
    }

    // Detect classes
    const classMatch = line.match(classRegex);
    if (classMatch) {
      result.classes.push({
        name: classMatch[1],
        bases: classMatch[2] ? classMatch[2].split(",").map((s) => s.trim()) : [],
        loc: i + 1,
      });
    }

    // Detect functions
    const fnMatch = line.match(fnRegex);
    if (fnMatch) {
      const name = fnMatch[1];
      const rawParams = fnMatch[2] || "";
      const returnType = fnMatch[3] ? fnMatch[3].trim() : "None";
      const params = rawParams
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p.length > 0 && p !== "self" && p !== "cls");

      // Extract function block
      const startLine = i;
      let bodyLines = [line];
      let docstring = "";

      for (let j = i + 1; j < Math.min(lines.length, i + 40); j++) {
        if (/^\s*""".*"""\s*$/.test(lines[j]) || /^\s*'''.*'''\s*$/.test(lines[j])) {
          docstring = lines[j].replace(/["']/g, "").trim();
        }
        if (lines[j].trim() === "" || /^\s+/.test(lines[j])) {
          bodyLines.push(lines[j]);
        } else {
          break;
        }
      }

      const code = bodyLines.join("\n");
      result.functions.push({
        name,
        params,
        async: line.includes("async def"),
        returnType,
        docstring,
        loc: startLine + 1,
        code: code.slice(0, 1000),
        complexity: estimateComplexity(code),
      });
    }
  }

  return result;
}

/**
 * Parses C, C++, Java, C#, Go using generic signature matching
 */
function parseGenericCodeFile(filePath, content) {
  const result = { filePath, functions: [], classes: [], imports: [], exports: [], parseError: null };
  const lines = content.split("\n");

  const methodRegex = /(?:public|private|protected|static|final|async|void|int|float|double|char|bool|boolean|string|auto|func)\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(methodRegex);
    if (match && !line.includes("=") && !line.startsWith("//") && !line.startsWith("*")) {
      const name = match[1];
      if (name && !["if", "for", "while", "switch", "catch"].includes(name)) {
        const rawParams = match[2] || "";
        const params = rawParams
          .split(",")
          .map((p) => p.trim().split(/\s+/).pop())
          .filter((p) => p && p.length > 0);

        result.functions.push({
          name,
          params,
          loc: i + 1,
          code: lines.slice(i, Math.min(lines.length, i + 25)).join("\n"),
          complexity: estimateComplexity(line),
        });
      }
    }
  }

  return result;
}

/**
 * Parses JS/TS using Babel AST
 */
function parseJsFile(filePath, content) {
  const result = { filePath, functions: [], classes: [], imports: [], exports: [], parseError: null };

  try {
    const ast = parser.parse(content, PARSE_OPTS);

    traverse(ast, {
      FunctionDeclaration(p) {
        if (p.node.id) {
          const code = sliceSource(content, p.node);
          result.functions.push({
            name: p.node.id.name,
            params: p.node.params.map(paramName),
            async: Boolean(p.node.async),
            loc: p.node.loc ? p.node.loc.start.line : null,
            code,
            complexity: estimateComplexity(code),
          });
        }
      },
      VariableDeclarator(p) {
        const init = p.node.init;
        if (init && (init.type === "ArrowFunctionExpression" || init.type === "FunctionExpression") && p.node.id?.name) {
          const code = sliceSource(content, p.node);
          result.functions.push({
            name: p.node.id.name,
            params: init.params.map(paramName),
            async: Boolean(init.async),
            loc: p.node.loc ? p.node.loc.start.line : null,
            code,
            complexity: estimateComplexity(code),
          });
        }
      },
      ClassDeclaration(p) {
        if (p.node.id) {
          result.classes.push({
            name: p.node.id.name,
            methods: p.node.body.body
              .filter((m) => m.type === "ClassMethod" && m.key?.name)
              .map((m) => m.key.name),
          });
        }
      },
      ImportDeclaration(p) {
        if (p.node.source?.value) result.imports.push(p.node.source.value);
      },
    });
  } catch (err) {
    result.parseError = err.message;
    // Fall back to regex parser
    return parseGenericCodeFile(filePath, content);
  }

  return result;
}

function parseGoFile(filePath, content) {
  const result = { filePath, functions: [], classes: [], imports: [], exports: [], parseError: null };
  const lines = content.split("\n");
  const goFnRegex = /func\s+(?:\((?:[a-zA-Z0-9_*]+\s+)?([a-zA-Z0-9_*]+)\)\s+)?([a-zA-Z0-9_]+)\s*\(([^)]*)\)(?:\s*([^{]+))?/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*import\s+/.test(line)) {
      result.imports.push(line.trim());
    }
    const match = line.match(goFnRegex);
    if (match) {
      const receiver = match[1] || "";
      const name = match[2];
      const rawParams = match[3] || "";
      const returnType = match[4] ? match[4].trim() : "void";
      const params = rawParams
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);

      const fnName = receiver ? `(${receiver}).${name}` : name;
      const code = lines.slice(i, Math.min(lines.length, i + 30)).join("\n");
      result.functions.push({
        name: fnName,
        params,
        returnType,
        loc: i + 1,
        code: code.slice(0, 1000),
        complexity: estimateComplexity(code),
      });
    }
  }
  return result;
}

function parseRustFile(filePath, content) {
  const result = { filePath, functions: [], classes: [], imports: [], exports: [], parseError: null };
  const lines = content.split("\n");
  const rustFnRegex = /(?:pub(?:\([^)]+\))?\s+)?(?:async\s+)?fn\s+([a-zA-Z0-9_]+)(?:<[^>]+>)?\s*\(([^)]*)\)(?:\s*->\s*([^{]+))?/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*use\s+/.test(line)) {
      result.imports.push(line.trim());
    }
    const match = line.match(rustFnRegex);
    if (match) {
      const name = match[1];
      const rawParams = match[2] || "";
      const returnType = match[3] ? match[3].trim() : "()";
      const params = rawParams
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p && !p.startsWith("&self") && p !== "self");

      const code = lines.slice(i, Math.min(lines.length, i + 30)).join("\n");
      result.functions.push({
        name,
        params,
        returnType,
        loc: i + 1,
        code: code.slice(0, 1000),
        complexity: estimateComplexity(code),
      });
    }
  }
  return result;
}

function parseFile(filePath, content) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".py") {
    return parsePythonFile(filePath, content);
  }
  if ([".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"].includes(ext)) {
    return parseJsFile(filePath, content);
  }
  if (ext === ".go") {
    return parseGoFile(filePath, content);
  }
  if (ext === ".rs") {
    return parseRustFile(filePath, content);
  }
  if ([".java", ".cpp", ".c", ".h", ".hpp", ".cs", ".php", ".rb"].includes(ext)) {
    return parseGenericCodeFile(filePath, content);
  }

  return { filePath, functions: [], classes: [], imports: [], exports: [], parseError: null };
}

function paramName(p) {
  if (p.type === "Identifier") return p.name;
  if (p.type === "AssignmentPattern" && p.left?.type === "Identifier") return p.left.name;
  if (p.type === "ObjectPattern") return "{destructured}";
  if (p.type === "RestElement") return `...${p.argument?.name || "rest"}`;
  return "arg";
}

function sliceSource(content, node) {
  if (!node.start || !node.end) return "";
  return content.slice(node.start, node.end);
}

function parseFiles(files = []) {
  const PARSEABLE = new Set([
    ".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs",
    ".py", ".java", ".cpp", ".c", ".h", ".hpp", ".cs", ".go", ".rs", ".php", ".rb",
  ]);

  return files
    .filter((f) => {
      const ext = (f.extension || path.extname(f.path || "")).toLowerCase();
      return PARSEABLE.has(ext);
    })
    .map((f) => parseFile(f.path, f.content));
}

module.exports = { parseFile, parseFiles };
