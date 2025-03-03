import express from "express";
import { prisma } from "../../db/connectDB.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt.js";
import { generateVerificationToken } from "../utils/generateVerificationToken.js";

import { sendPasswordResetEmail, sendVerificationEmail, sendWelcomeEmail } from "../utils/email.js";
import crypto from "crypto";

//Sigup Logic for email
export const signup = async (req, res) => {
  const {
    fname,
    lname,
    email,
    password,
    provider,
    role,
    companyName,
    address,
    gender,
    dob,
  } = req.body; //Takes inputs necessary: [name,email,password], optional: [provider,role]
  console.log("Received signup request:", req.body);
  try {
    if (!fname || !lname || !email || !password) {
      throw new Error("All fields are required!");
    }
    const userExist = await prisma.user.findUnique({
      where: { email },
    });
    if (userExist) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = generateVerificationToken();

    const result = await prisma.$transaction(async (prisma) => {
      // Step 1: Create User
      const user = await prisma.user.create({
        data: {
          fname,
          lname,
          email,
          password: hashedPassword,
          verificationToken,
          verificationTokenExpires: new Date(Date.now() + 30 * 60 * 1000),
          provider: "LOCAL",
          role,
        },
      });

      let roleData;

      // Step 2: Conditionally Create Client or Engineer
      if (role === "Client") {
        if (!companyName || !address) {
          throw new Error("Company name and address are required for Clients!");
        }
        roleData = await prisma.client.create({
          data: {
            userId: user.id,
            companyName,
            address,
          },
        });
      } else if (role === "Engineer") {
        if (!gender || !dob) {
          throw new Error("Gender and DOB are required for Engineers!");
        }
        roleData = await prisma.engineer.create({
          data: {
            userId: user.id,
            gender,
            dob: new Date(dob), // ✅ Convert to Date object
          },
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

    const token = generateToken(res, user);

    await sendVerificationEmail(user.email, verificationToken);

    return res.status(201).json({
      success: true,
      message: "User created successfully!",
      user, // ✅ Send 'user' properly
      client: role === "Client" ? roleData : undefined, // Send client data if applicable
      engineer: role === "Engineer" ? roleData : undefined, // Send engineer data if applicable
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
        verificationTokenExpires: { gt: new Date() }, 
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
        isVerfied: true, //Mark as verified
        verificationToken: null, // Remove token
        verificationTokenExpires: null, //Clear expiry date
      },
    });
    await sendWelcomeEmail(user.email, user.fname);
    res
      .status(200)
      .json({ success: true, message: "Email Verified Successfully" });
  } catch (error) {
    throw new Error(`Error sending welcome email: ${error}`);
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

    await prisma.user.update({
      where: { email },
      data: { lastLogin: new Date() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User does not exist" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

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
    });
  } catch (error) {
    throw new Error({ success: false, message: error.message });
  }
};

//Logout from account logic
export const logout = async (req, res) => {
  res.clearCookie("jwt");
  res.status(200).json({ success: true, message: "Logged out successfully" });
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

    res.status(200).json({
      success: true,
      user: {
        user: { ...user, password: undefined },
      },
    });
  } catch (error) {
    res.status(400).json({success:false, message:error.message})
  }
};
