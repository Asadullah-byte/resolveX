import { Router } from "express";
import {
  login,
  logout,
  signup,
  verifyEmail,
  forgotPassword
} from "../controllers/authController.js";
import { googleAuth } from "../controllers/googleAuth.js";
import { githubOAuth } from "../controllers/githubAuth.js";

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
router.post("/forgot-password", forgotPassword);

export default router;
