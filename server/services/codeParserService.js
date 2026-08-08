const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const logger = require("../utils/logger");

const PARSE_OPTS = {
  sourceType: "unambiguous",
  plugins: ["jsx", "typescript", "classProperties", "objectRestSpread", "optionalChaining"],
  errorRecovery: true,
};

/**
 * Parses a JS/JSX/TS file into an AST and extracts top-level functions,
 * classes, and import/export info. Falls back gracefully on parse errors
 * (common with hackathon-quality code).
 */
function parseFile(filePath, content) {
  const result = { filePath, functions: [], classes: [], imports: [], exports: [], parseError: null };

  try {
    const ast = parser.parse(content, PARSE_OPTS);

    traverse(ast, {
      FunctionDeclaration(p) {
        if (p.node.id) {
          result.functions.push({
            name: p.node.id.name,
            params: p.node.params.map(paramName),
            async: p.node.async,
            loc: p.node.loc ? p.node.loc.start.line : null,
            code: sliceSource(content, p.node),
          });
        }
      },
      VariableDeclarator(p) {
        const init = p.node.init;
        if (init && (init.type === "ArrowFunctionExpression" || init.type === "FunctionExpression") && p.node.id.name) {
          result.functions.push({
            name: p.node.id.name,
            params: init.params.map(paramName),
            async: init.async,
            loc: p.node.loc ? p.node.loc.start.line : null,
            code: sliceSource(content, p.node),
          });
        }
      },
      ClassDeclaration(p) {
        if (p.node.id) {
          result.classes.push({
            name: p.node.id.name,
            methods: p.node.body.body
              .filter((m) => m.type === "ClassMethod")
              .map((m) => m.key.name),
          });
        }
      },
      ImportDeclaration(p) {
        result.imports.push(p.node.source.value);
      },
      ExportNamedDeclaration() {
        result.exports.push("named");
      },
      ExportDefaultDeclaration() {
        result.exports.push("default");
      },
    });
  } catch (err) {
    result.parseError = err.message;
    logger.warn(`AST parse failed for ${filePath}: ${err.message}`);
  }

  return result;
}

function paramName(p) {
  if (p.type === "Identifier") return p.name;
  if (p.type === "AssignmentPattern" && p.left.type === "Identifier") return p.left.name;
  if (p.type === "ObjectPattern") return "{destructured}";
  if (p.type === "RestElement") return `...${p.argument.name || "rest"}`;
  return "arg";
}

function sliceSource(content, node) {
  if (!node.start || !node.end) return "";
  return content.slice(node.start, node.end);
}

/** Parses a whole set of {path, content} file objects, skipping non-parseable extensions */
function parseFiles(files) {
  const PARSEABLE = new Set([".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"]);
  return files
    .filter((f) => PARSEABLE.has(f.extension))
    .map((f) => parseFile(f.path, f.content));
}

module.exports = { parseFile, parseFiles };
