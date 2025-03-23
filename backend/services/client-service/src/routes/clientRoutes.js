import { Router } from "express";
import { verifyToken } from "../../../common-middleware/verifyToken.js";
import {
  checkAuth,
  uploadFile,
  uploadHistory,
  getAnalyzedFiles,
  // getFileDetails,
} from "../controllers/clientController.js";
import upload from "../middleware/upload.js";
// import { processNextFile } from "../controllers/clientController.js";

const router = Router();

//Verified User
router.get("/check-auth", verifyToken, checkAuth);

router.post("/upload", upload.array("logFiles", 5), uploadFile);

router.get("/files", uploadHistory);

router.get("/analyzed-files", getAnalyzedFiles);

// router.get("/files/:encryptedFileId", getFileDetails);

export default router;
