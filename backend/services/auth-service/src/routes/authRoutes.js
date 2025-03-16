import { Router } from "express";
import {
  login,
  logout,
  signup,
  verifyEmail,
  forgotPassword,
  resetPassword,
  checkAuth,
  refreshToken
} from "../controllers/authController.js";
import { googleAuth } from "../controllers/googleAuth.js";
import { githubOAuth } from "../controllers/githubAuth.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = Router();

//Signup route for email
router.post("/signup", signup );

router.post("/google", googleAuth);
router.post("/github", githubOAuth);

//Login route for email
router.post("/login", login);

//Logout Route for email
router.post("/logout", logout);

//Verify email
router.post("/verify-email", verifyEmail);

//Forgot Password 
router.post("/forgot-password", forgotPassword);

//Reset email Password
router.post("/reset-password/:token", resetPassword);

//refresh token Route
router.post("/refresh-token", refreshToken)

//Verified User 
router.get("/check-auth", verifyToken, checkAuth );

export default router;