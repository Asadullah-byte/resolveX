  import { Router } from "express";
  import { verifyToken } from "../../../common-middleware/verifyToken.js";
  import {
    checkAuth,
    uploadFile,
    uploadHistory,
    getAnalyzedFiles,
    // getFileDetails,
    getFileErrors,
    getErrorFilesList,
    getDashboardAnalytics,
    getEngineerRecommendations
  } from "../controllers/clientController.js";
  import upload from "../middleware/upload.js";
  import { authorizeRoles } from "../../../common-middleware/roleCheck.js";
  import rateLimit from 'express-rate-limit';
  import { assignEngineerToError } from "../controllers/assignmentController.js";
 


  const router = Router();


  const engineerSearchLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // Limit each IP to 10 requests per minute
    message: "Too many engineer search requests, please try again later",
  });


  router.get("/check-auth", verifyToken, authorizeRoles("Client"), checkAuth);

  router.post(
    "/upload",
    verifyToken,
    authorizeRoles("Client"),
    upload.array("logFiles", 5),
    uploadFile
  );

  router.get("/files", verifyToken, authorizeRoles("Client"), uploadHistory);

  router.get(
    "/analyzed-files/:userId",
    verifyToken,
    authorizeRoles("Client"),
    getAnalyzedFiles
  );

  
  router.get(
    "/files/errors",
    verifyToken,
    authorizeRoles("Client"),
    getErrorFilesList
  );

  router.get(
    "/files/:fileId/errors",
    verifyToken,
    authorizeRoles("Client"),
    getFileErrors
  );

  router.get(
    "/engineers/recommend",
    verifyToken,
    authorizeRoles("Client"),
    engineerSearchLimiter,
    getEngineerRecommendations
  );


  router.get(
    "/dashboard",
    verifyToken,
    authorizeRoles("Client"),
    getDashboardAnalytics
  );


  router.post(
    "/assign",
    verifyToken,
    authorizeRoles("Client"),
    assignEngineerToError
  );


  export default router;
