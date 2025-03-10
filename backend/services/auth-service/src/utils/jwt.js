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

export const generateToken = (res, user) => {
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    privatekey,
    { algorithm: "RS256", expiresIn: "7d" }
  );
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  return token;
};
