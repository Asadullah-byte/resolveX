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
import { authorizeRoles } from "../middleware/roleCheck.js";
import  {generateMagicLink, verifyMagicLink} from '../controllers/engineerAuthController.js';
import rateLimit from 'express-rate-limit';

const router = Router();

const magicLinkLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: "Too many magic link requests, please try again later"
});

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


router.post('/magic-link', magicLinkLimiter, async (req, res) => {
  try {
    if (!req.body.email) {
      return res.status(400).json({ 
        success: false,
        error: "Email is required"
      });
    }
    
    const link = await generateMagicLink(req.body.email);
    res.json({ 
      success: true,
      data: { link },
      message: "Magic link generated successfully"
    });
  } catch (err) {
    res.status(400).json({ 
      success: false,
      error: err.message,
      details: "Failed to generate magic link"
    });
  }
});

router.get('/magic-link/verify', async (req, res) => {
  try {
    if (!req.query.token) {
      return res.status(400).json({ 
        success: false,
        error: "Token is required"
      });
    }
    
    const tokens = await verifyMagicLink(req.query.token);
    
    // Secure cookie settings
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    };
    
    res.cookie('accessToken', tokens.accessToken, cookieOptions);
    res.cookie('refreshToken', tokens.refreshToken, cookieOptions);
    
    res.json({ 
      success: true,
      message: "Authentication successful"
    });
  } catch (err) {
    res.status(401).json({ 
      success: false,
      error: err.message,
      details: "Magic link verification failed"
    });
  }
});


export default router;