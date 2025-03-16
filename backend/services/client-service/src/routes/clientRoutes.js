import { Router } from "express";
import { verifyToken } from "../../../common-middleware/verifyToken.js";
import { checkAuth, uploadFile,  uploadHistory } from "../controllers/clientController.js";
import upload from "../middleware/upload.js";

const router = Router();

router.post("/upload", upload.array("logFiles", 5), uploadFile);


//Verified User
router.get("/check-auth", verifyToken, checkAuth);


router.get("/files" , uploadHistory)
export default router;
