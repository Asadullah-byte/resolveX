import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
//  using major user data so because of oauth2.0 it returns user data with id, email & role

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const privatekey = fs.readFileSync(
  path.join(__dirname, "../keys/private.pem"),
  "utf-8"
);



export const generateTokens = (res, user) => {
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    privatekey,
    { algorithm: "RS256", expiresIn: "7d" }
  );

  const refreshToken = jwt.sign({ userId: user.id }, privatekey, {
    algorithm: "RS256",
    expiresIn: "30d",
  });
  res.cookie("token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
  return { accessToken, refreshToken };
};

export const generateMagicLinkToken = (email) => {
  return jwt.sign(
    { email, purpose: 'magic_link' },
    privatekey,
    { algorithm: "RS256", expiresIn: "1h" } // 1 hour expiry
  );
};