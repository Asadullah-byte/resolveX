import express from "express";
import axios from "axios";
import { prisma } from "../../../../db/connectDB.js"; // adjust if needed
import dotenv from "dotenv"
import {Assignment }from "../models/assignmentModel.js"; 


dotenv.config();
const router = express.Router();

const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3003/auth/github/callback';

router.get('/github', (req, res) => {
  const { assignmentId } = req.query;

  // Set assignmentId in a cookie for later use
  res.cookie('oauth_assignment', assignmentId, { httpOnly: true });

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=repo`;
  res.redirect(githubAuthUrl);
});

router.get('/github/callback', async (req, res) => {
  const assignmentId = req.cookies.oauth_assignment; // 🔥 restored from cookie
  const { code } = req.query;

  try {
    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } }
    );

    const accessToken = tokenRes.data.access_token;
    if (!accessToken) throw new Error("Access token not received");

    const reposRes = await axios.get("https://api.github.com/user/repos", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const selectedRepo = reposRes.data[0];
    if (!selectedRepo) throw new Error("No repo found in user's account");

    await Assignment.findByIdAndUpdate(assignmentId, {
      repoLinked: true,
      repoUrl: selectedRepo.full_name,
      repoAccessToken: accessToken,
    });

    res.clearCookie('oauth_assignment'); // 🔒 clean up
    res.redirect(`http://localhost:5173/assignment/${assignmentId}?repo=linked`);
  } catch (err) {
    console.error("GitHub OAuth callback failed:", err.message);
    res.redirect(`http://localhost:5173/assignment/${assignmentId || ""}?error=oauth_failed`);
  }
});

router.post("/github/revoke", async (req, res) => {
  try {
    const { assignmentId } = req.query;
    if (!assignmentId) {
      return res.status(400).json({ success: false, message: "Missing assignmentId" });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment || !assignment.repoAccessToken) {
      return res.status(404).json({ success: false, message: "No token or assignment not found" });
    }

    // Simulate revoke: clear the token and flag
    assignment.repoAccessToken = null;
    assignment.repoLinked = false;
    await assignment.save();

    return res.json({ success: true, message: "GitHub access revoked." });
  } catch (err) {
    console.error("GitHub revoke failed:", err);
    return res.status(500).json({ success: false, message: "Failed to revoke access" });
  }
});




export default router;