const multer = require("multer");
const path = require("path");
const os = require("os");
const fs = require("fs");

const TEMP_DIR = path.join(os.tmpdir(), "readmycode_repos");
try {
  if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });
} catch (e) {}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, TEMP_DIR),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

function fileFilter(req, file, cb) {
  if (file.mimetype === "application/zip" || file.originalname.endsWith(".zip")) {
    cb(null, true);
  } else {
    cb(new Error("Only .zip files are allowed"), false);
  }
}

// Vercel serverless request body is capped at 4.5 MB.
// Files exceeding 4.5 MB should be analyzed via public GitHub URL.
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 4.5 * 1024 * 1024 }, // 4.5MB serverless limit
});

module.exports = upload;
