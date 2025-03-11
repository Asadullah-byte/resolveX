import { Router } from "express";
import { verifyToken } from "../../../common-middleware/verifyToken.js";
import { checkAuth, uploadFile } from "../controllers/clientController.js";
import upload from "../middleware/upload.js";

const router = Router();

router.post("/upload", upload.multiple("logFile"), uploadFile);
//Verified User
router.get("/check-auth", verifyToken, checkAuth);

export default router;
