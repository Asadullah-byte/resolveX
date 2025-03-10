import multer from "multer";
import fs from "fs";
import path from "path";

// Ensure temp directory exists
const tempDir = path.join("public", "temp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// File filter (only allow specific types)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["text/plain", "application/json"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only .log, .txt, and .json allowed."));
  }
};

const upload = multer({ storage, fileFilter });

export default upload;
