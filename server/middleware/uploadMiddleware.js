const multer = require("multer");
const path = require("path");

// Used for the alternate "upload a zip" flow instead of a GitHub URL.
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "..", "temp_repos")),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

function fileFilter(req, file, cb) {
  if (file.mimetype === "application/zip" || file.originalname.endsWith(".zip")) {
    cb(null, true);
  } else {
    cb(new Error("Only .zip files are allowed"), false);
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB cap
});

module.exports = upload;
