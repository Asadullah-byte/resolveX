import express from "express";
import { prisma } from "../../../../db/connectDB.js";
import bcrypt from "bcryptjs";
import { generateTokens } from "../utils/jwt.js";
import { generateVerificationToken } from "../utils/generateVerificationToken.js";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import {
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../utils/email.js";
import crypto from "crypto";

//Sigup Logic for email
export const signup = async (req, res) => {
  const { fname, lname, email, password, provider, role, companyName } =
    req.body; //Takes inputs necessary: [name,email,password], optional: [provider,role]
  console.log("Received signup request:", req.body);
  try {
    if (!fname || !lname || !email || !password) {
      // validate for required fields are filled
      throw new Error("All fields are required!");
    }
    const userExist = await prisma.user.findUnique({
      //find user by email as email is set to be unique for each
      where: { email },
    });
    if (userExist) {
      //if user exists return a 400 error to notify user that that email already exists
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Hashing password using bcrypt

    const verificationToken = generateVerificationToken(); //9 digit token is generated using simple JS logic. look in [utils folder]

    const result = await prisma.$transaction(async (prisma) => {
      // Inserting data using transcation to insert in dependent tables at same time. NOTE: [Highly not recommended bad practice.]
      // Step 1: Create User
      const user = await prisma.user.create({
        ///Inserted in User table
        data: {
          fname,
          lname,
          email,
          password: hashedPassword,
          verificationToken,
          verificationTokenExpires: new Date(Date.now() + 30 * 60 * 1000), //Token Valid for 30-minutes
          provider: "LOCAL",
          role,
        },
      });

      let roleData; //local variabel to differentiate user based on role. To inserted in related table

      // Step 2: Conditionally Create Client or Engineer
      if (role === "Client") {
        if (!companyName) {
          throw new Error("Company name is required for Clients!");
        }
        roleData = await prisma.client.create({
          data: {
            userId: user.id,
            companyName,
          },
        });
      } else if (role === "Engineer") {
        roleData = await prisma.engineer.create({
          data: {
            userId: user.id,  
            // Initialize career with empty values
            career: {
              create: {
                field: "",
                specialization: "",
                skills: [],
                experience: 0,
                bio: "",
                intro: "",
                socialAccounts: {} // Empty JSON object
              }
            },
            // Initialize with one empty education entry
            education: {
              create: {
                institute: "",
                type: "BACHELORS", // Default value
                major: "",
                degree: "",
                startYear: new Date().getFullYear(),
                endYear: new Date().getFullYear()
              }
            }
          },
          include: {
            career: true,
            education: true
          }
        });
      }

      return { user, roleData };
    });

    const { user, roleData } = result;

    if (!user) {
      return res
        .status(500)
        .json({ success: false, message: "User creation failed" });
    }

    const { accessToken, refreshToken } = generateTokens(res, user); //Generating JWT token Valid for 7 days login period
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    await sendVerificationEmail(user.email, verificationToken);

    return res.status(201).json({
      success: true,
      message: "User created successfully!",
      user,
      client: role === "Client" ? roleData : undefined, // Sending client data based on user selection
      engineer: role === "Engineer" ? roleData : undefined, // Sending engineer data based on user selection
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

//Verify email logic
export const verifyEmail = async (req, res) => {
  const { code } = req.body;

  try {
    //  Find the user with the given verification code & check if token is not expired
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: code,
        verificationTokenExpires: { gt: new Date() }, //Sets expire date
      },
    });

    // If user not found or token expired, return error
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    // Update the user to mark as verified and remove the verification token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true, //Mark as verified
        verificationToken: null, // Remove token
        verificationTokenExpires: null, //Clear expiry date
      },
    });
    await sendWelcomeEmail(user.email, user.fname);
    res
      .status(200)
      .json({ success: true, message: "Email Verified Successfully" });
  } catch (error) {
    console.log("error in verifyEmail ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//Login logic
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      throw new Error("All fields are required!");
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = generateTokens(res, user);

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date(), refreshToken }, //update user login date to current date / time
    });

    const isPasswordValid = await bcrypt.compare(password, user.password); //decrypt user password and compare

    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }
    user.lastLogin = new Date();
    res.status(200).json({
      success: true,
      message: "logged in Succesfully",
      user,
      redirectTo: user.role === "Engineer" ? "/engineer/profile" : "/dashboard",
    });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

//Logout from account logic
export const logout = async (req, res) => {
  try {
    // 1. Find the user by refreshToken
    const user = await prisma.user.findFirst({
      where: { refreshToken: req.cookies.refreshToken },
    });

    if (user) {
      // 2. Update by id (which is unique)
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: null },
      });
    }

    // 3. Clear cookies with the same options as when set
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      path: "/",
    };
    res.clearCookie("token", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Logout failed" });
  }
};

//forgot password logic
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User does not exist" });
    }

    //Genereate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); //1 hour duration

    await prisma.user.update({
      where: { email },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetTokenExpiresAt,
      },
    });

    await sendPasswordResetEmail(
      //sending user email for reset password
      user.email,
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`
    );

    return res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    res.status(401).json({ success: false, messgae: error.message });
  }
};

//reset Password Logic
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() }, // Ensures token is not expired
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }
    // Hash the new password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password and clear reset token fields
    await prisma.user.update({
      where: { id: user.id }, // Use unique field to update
      data: {
        password: hashedPassword,
        resetPasswordToken: null, // Clear reset token
        resetPasswordExpires: null, // Clear expiration time
      },
    });

    await sendPasswordResetEmail(user.email);

    return res.status(200).json({
      success: true,
      message:
        "Password reset successful. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const privateKey = fs.readFileSync(
  path.join(__dirname, "../keys/private.pem"),
  "utf-8"
);
const publicKey = fs.readFileSync(
  path.join(__dirname, "../keys/public.pem"),
  "utf-8"
);

export const refreshToken = async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  try {
    const decoded = jwt.verify(refreshToken, publicKey);

    // Check if the refresh token matches the one stored in DB
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId, refreshToken },
    });

    if (!user) {
      return res
        .status(403)
        .json({ message: "Invalid or expired refresh token" });
    }

    // Generate a new Access Token
    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      privateKey,
      { algorithm: "RS256", expiresIn: "7d" }
    );

    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ message: "Token refreshed", accessToken });
  } catch (error) {
    console.error("❌ Refresh Token Error:", error.message);
    return res
      .status(403)
      .json({ message: "Invalid or expired refresh token" });
  }
};

//checking if user is verified
export const checkAuth = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });
    if (!user)
      return res
        .status(400)
        .json({ succes: false, message: "User not found!!" });
    if (!user.isVerified) {
      return res
        .status(401)
        .json({ success: false, message: "Email not verified" });
    }

    res.status(200).json({
      success: true,
      user: {
        user: { ...user, password: undefined },
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
