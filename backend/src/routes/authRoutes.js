import { Router } from "express";
import {
  login,
  logout,
  signup,
  verifyEmail,
} from "../controllers/authController.js";
import { googleOAuth } from "../controllers/googleAuth.js";
import { githubOAuth } from "../controllers/githubAuth.js";

const router = Router();

//Signup route for email
router.post("/signup", signup );

router.post("/google", googleOAuth);
router.post("/github", githubOAuth);

//Login route for email
router.post("/login", login);

//Logout Route for email
router.post("/logout", logout);

//Verify email
router.post("/verify-email", verifyEmail);

export default router;
