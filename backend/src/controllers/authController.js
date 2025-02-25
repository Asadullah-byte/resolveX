import express from "express";
import { prisma } from "../../db/connectDB.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt.js";
import { generateVerificationToken } from "../utils/generateVerificationToken.js";
import { sendVerificationEmail, sendWelcomeEmail } from "../mailtrap/email.js";

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
    // 1️⃣ Find the user with the given verification code & check if token is not expired
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: code,
        verificationTokenExpires: { gt: new Date() }, // ✅ Correct syntax
      },
    });

    // 2️⃣ If user not found or token expired, return error
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    // 3️⃣ Update the user to mark as verified and remove the verification token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerfied: true, // ✅ Mark as verified
        verificationToken: null, // ✅ Remove token
        verificationTokenExpires: null, // ✅ Clear expiry date
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

export const login = async (req, res) => {
 const {email, password} = req.body;
 try {

  if(!email || !password){
    throw new Error("All fields are required!");
  }

  const user = await prisma.user.findUnique({
    where: { email },
    
  });

  await prisma.user.update({
    where: { email },
    data: { lastLogin: new Date() },
  });

  if(!user){
    return res.status(400).json({success:false, message:"User does not exist"});
  } 

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if(!isPasswordValid){
    return res.status(400).json({success:false, message:"Invalid credentials"});
  }
  user.lastLogin = new Date();
  res.status(200).json({
    success:true,
    message: "logged in Succesfully",
    user,
  })
 } catch (error) {
  throw new Error({success:false, message:error.message});
 }
};

export const logout = async (req, res) => {
  res.clearCookie("jwt");
  res.status(200).json({success:true, message:"Logged out successfully"});  
};
