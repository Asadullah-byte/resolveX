import { verifyToken } from "../../../common-middleware/verifyToken.js";
import { prisma } from "../../../../db/connectDB.js";

export const verifyEngineer = async (req, res, next) => {
  try {
    // First verify the token using the shared middleware
    verifyToken(req, res, () => {
      // After token verification, check if user is an engineer
      if (req.user.role !== 'Engineer') {
        return res.status(403).json({ 
          success: false, 
          message: "Access denied. Engineer account required." 
        });
      }
      next();
    });
  } catch (error) {
    console.error("Engineer auth error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};