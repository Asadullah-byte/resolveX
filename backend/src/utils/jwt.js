import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
//  using major user data so because of oauth2.0 it returns user data with id, email & role
export const generateToken = (res, user) => {
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
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
