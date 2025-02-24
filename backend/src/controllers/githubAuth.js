import axios from "axios";
import { prisma } from "../../db/connectDB.js";
import { generateToken } from "../utils/jwt.js";

// GitHub OAuth
export const githubOAuth = async (req, res) => {
  const { code } = req.body;

  try {
    // Exchange `code` for access token
    const { data } = await axios.post("https://github.com/login/oauth/access_token", {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }, { headers: { Accept: "application/json" } });

    // Get user info from GitHub
    const { data: userInfo } = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${data.access_token}` },
    });

    let user = await prisma.user.findUnique({ where: { email: userInfo.email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: userInfo.name,
          email: userInfo.email,
          provider: "GITHUB",
          role: "Engineer", // Default role
        },
      });
    }

    const token = generateToken(user);
    res.json({ success: true, token, user });
  } catch (error) {
    res.status(400).json({ success: false, message: "GitHub OAuth failed" });
  }
};
