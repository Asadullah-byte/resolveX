import { Router } from "express";
import {
  getEngineerProfile,
  updateEngineerProfile,
  getEngineerDashboard,
} from "../controllers/engineerController.js";
import { verifyToken } from "../../../common-middleware/verifyToken.js";
import { authorizeRoles } from "../../../common-middleware/roleCheck.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = path.join(__dirname, '../../uploads');
    
    if (file.fieldname === 'profilePic') {
      uploadPath = path.join(uploadPath, 'profile');
    } else if (file.fieldname === 'resume') {
      uploadPath = path.join(uploadPath, 'resumes');
    }
    
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'));
    }
  }
});

const router = Router();

// Apply authentication and role check middleware to all routes
router.use(verifyToken);
router.use(authorizeRoles('Engineer'));

// Engineer profile routes
router.get('/profile', getEngineerProfile);
router.put(
  '/profile', 
  upload.fields([
    { name: 'profilePic', maxCount: 1 },
    { name: 'resume', maxCount: 1 }
  ]), 
  updateEngineerProfile
);

// Dashboard route
router.get('/dashboard', getEngineerDashboard);

export default router;