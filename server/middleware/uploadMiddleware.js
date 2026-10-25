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

// Vercel serverless request body is capped at 4.5 MB total (including multipart boundaries).
// We set multer limit to 4 MB (with 1 file limit) to leave ample overhead for form headers.
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 4 * 1024 * 1024, // 4MB
    files: 1,
  },
});

module.exports = upload;
