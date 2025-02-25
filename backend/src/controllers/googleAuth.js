import axios from "axios";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "../../db/connectDB.js";
import { generateToken } from "../utils/jwt.js";
import { generateVerificationToken } from "../utils/generateVerificationToken.js";
import { sendVerificationEmail, sendWelcomeEmail } from "../mailtrap/email.js";
import dotenv from "dotenv";

dotenv.config();

// Initialize Google OAuth Client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuth = async (req, res) => {
  console.log("Received request body:", req.body);
  const { credential } = req.body; // Get the JWT ID Token from frontend

  if (!credential) {
    return res
      .status(400)
      .json({ success: false, message: "Google credential is missing" });
  }

  try {
    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    let user = await prisma.user.findUnique({ where: { email } });

    
    const verificationToken = generateVerificationToken();
    const role = "Engineer";
    const gender = "MALE";
    const dob = "1990-01-01";

    const [fname, ...lnameArr] = name.split(" ");
    const lname = lnameArr.join(" ") || "N/A";

    if (!user) {
      const result = await prisma.$transaction(async (prisma) => {
        // Step 1: Create User
        const user = await prisma.user.create({
          data: {
            fname,
            lname,
            email,
            verificationToken,
            verificationTokenExpires: new Date(Date.now() + 30 * 60 * 1000),
            provider: "LOCAL",
            role: "Engineer",
            
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

      // Generate JWT Token for session
      const token = generateToken(res, user);

    await sendVerificationEmail(user.email, verificationToken);
    
      
  
    }
    

    
    res.json({ success: true,  user });

    return res.status(201).json({
      success: true,
      message: "User created successfully!",
      user, // ✅ Send 'user' properly
      
    });
  } catch (error) {
    console.error("Google OAuth Error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};
