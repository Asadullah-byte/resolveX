import axios from "axios";
import { prisma } from "../../db/connectDB.js";
import { generateToken } from "../utils/jwt.js";
import dotenv from "dotenv";

dotenv.config();
export const googleOAuth = async (req, res) => {
  const { code } = req.body;

  try {
    if (!code) {
      return res
        .status(400)
        .json({ success: false, message: "Authorization code is missing" });
    }
    // Exchange `code` for access token
    const { data } = await axios.post("https://oauth2.googleapis.com/token", {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
      code,
    });
    // Get user info from Google

    const { data: userInfo } = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${data.access_token}` },
      }
    );

    let user = await prisma.user.findUnique({
      where: { email: userInfo.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: userInfo.name,
          email: userInfo.email,
          provider: "GOOGLE",
          role: "EndUser", // Default role
        },
      });
    }

    const token = generateToken(user);
    res.json({ success: true, token, user });
  } catch (error) {
    res.status(400).json({ success: false, message: "Google OAuth failed" });
  }
};
