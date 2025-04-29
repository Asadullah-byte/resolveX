import JsonWebToken from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));


const publicKey = fs.readFileSync(
  path.join(__dirname, "../auth-service/src/keys/public.pem"),
  "utf-8"
);



export const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized - no cookie issued" });

  try {
    const decoded = JsonWebToken.verify(token,publicKey,{algorithms: ["RS256"]});

    if (!decoded) {
      return res
        .status(400)
        .json({ success: false, message: "Unauthorized -  invalid token" });
    }
    req.user = { id: decoded.userId , role: decoded.role};
    console.log("🔵 Middleware: User Info:", req.user); 
    next();
  } catch (error) {
    console.error("Error in verifyToken:", error);
  
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Unauthorized - Invalid token" });
    } else if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Unauthorized - Token expired" });
    }
  
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
  
};


export const verifyEngineer = (req, res, next) => {
  const token = req.cookies.accessToken;
  
  try {
    req.user = jwt.verify(token,publicKey,{algorithms: ["RS256"]});
    if (req.user.role !== 'engineer') throw new Error('Access denied');
    next();
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};