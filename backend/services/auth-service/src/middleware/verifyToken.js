import JsonWebToken from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));


const publicKey = fs.readFileSync(
  path.join(__dirname, "../keys/public.pem"),
  "utf-8"
);


const createErrorResponse = (status, message) => ({
  success: false,
  error: message,
  timestamp: new Date().toISOString()
});


export const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json(createErrorResponse(401, "Unauthorized - no cookie issued"));
  }

  try {
    const decoded = JsonWebToken.verify(token, publicKey, { algorithms: ["RS256"] });
    if (!decoded) {
      return res.status(401).json(createErrorResponse(401, "Unauthorized - invalid token"));
    }
    
    // Verify token expiration
    if (decoded.exp * 1000 < Date.now()) {
      return res.status(401).json(createErrorResponse(401, "Unauthorized - token expired"));
    }

    req.user = { id: decoded.userId, role: decoded.role };
    next();
  } catch (error) {
    console.error("Error in verifyToken:", error);
    
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json(createErrorResponse(401, "Unauthorized - Invalid token"));
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json(createErrorResponse(401, "Unauthorized - Token expired"));
    }
    
    return res.status(500).json(createErrorResponse(500, "Internal server error"));
  }
};

export const verifyEngineer = (req, res, next) => {
  const token = req.cookies.token;
  
  try {
    const decoded = JsonWebToken.verify(token, publicKey, { algorithms: ["RS256"] });
    
    // Verify token expiration
    if (decoded.exp * 1000 < Date.now()) {
      throw new Error('Token expired');
    }
    
    if (decoded.role !== 'engineer') {
      throw new Error('Access denied - engineer role required');
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json(createErrorResponse(401, err.message));
  }
};
