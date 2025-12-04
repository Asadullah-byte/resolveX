import { prisma } from "../../../../db/connectDB.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { generateTokens } from "../../../auth-service/src/utils/jwt.js";
import {Assignment} from "../models/assignmentModel.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const getEngineerProfile = async (req, res) => {
  try {
    const engineer = await prisma.engineer.findUnique({
      where: { userId: req.user.id },
      include: {
        user: {
          select: {
            fname: true,
            lname: true,
            email: true,
            profilePic: true,
          },
        },
        education: true,
        career: true,
      },
    });

    if (!engineer) {
      return res.status(404).json({ 
        success: false, 
        message: "Engineer profile not found" 
      });
    }

    res.status(200).json({ 
      success: true, 
      data: engineer 
    });
  } catch (error) {
    console.error("Error fetching engineer profile:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

export const updateEngineerProfile = async (req, res) => {
  try {
    // Parse basic info
    const basicInfo = {
      gender: req.body['basic.gender'],
      dob: req.body['basic.dob'],
      country: req.body['basic.country'],
      state: req.body['basic.state'],
      city: req.body['basic.city'],
      phoneNo: req.body['basic.phoneNo'],
    };

    // Parse career info
    const careerInfo = {
      field: req.body['career.field'],
      specialization: req.body['career.specialization'],
      skills: req.body['career.skills'] ? JSON.parse(req.body['career.skills']) : [],
      experience: req.body['career.experience'] ? parseInt(req.body['career.experience']) : null,
      bio: req.body['career.bio'],
      intro: req.body['career.intro'],
      socialAccounts: req.body['career.socialAccounts'] ? JSON.parse(req.body['career.socialAccounts']) : {},
    };

    // Parse education
    const educationData = JSON.parse(req.body.education);

    console.log("Received BasicInfo", basicInfo);
    console.log("Received education", educationData);
    console.log("Received career", careerInfo);

    // Handle file uploads
    const profilePic = req.files?.profilePic?.[0]?.filename;
    const resume = req.files?.resume?.[0]?.filename;

    // Update basic info
    const updatedEngineer = await prisma.engineer.update({
      where: { userId: req.user.id },
      data: {
        ...basicInfo,
        dob: basicInfo.dob ? new Date(basicInfo.dob) : undefined,
        profilePic: profilePic ? `/uploads/profile/${profilePic}` : undefined,
        resume: resume ? `/uploads/resumes/${resume}` : undefined,
      },
    });

    // Update or create career info
    if (careerInfo.field || careerInfo.specialization) {
      await prisma.career.upsert({
        where: { engineerId: updatedEngineer.id },
        update: careerInfo,
        create: {
          engineerId: updatedEngineer.id,
          ...careerInfo
        },
      });
    }

    // Handle education updates
    if (educationData && educationData.length > 0) {
      // First delete existing education records
      await prisma.education.deleteMany({
        where: { engineerId: updatedEngineer.id },
      });

      // Then create new ones
      for (const edu of educationData) {
        await prisma.education.create({
          data: {
            engineerId: updatedEngineer.id,
            institute: edu.institute,
            type: edu.type,
            major: edu.major,
            degree: edu.degree,
            marks: edu.marks ? parseFloat(edu.marks) : null,
            grade: edu.grade,
            startYear: edu.startYear ? parseInt(edu.startYear) : null,
            endYear: edu.endYear ? parseInt(edu.endYear) : null,
          },
        });
      }
    }

    const fullProfile = await prisma.engineer.findUnique({
      where: { id: updatedEngineer.id },
      include: {
        user: true,
        education: true,
        career: true,
      },
    });

    res.status(200).json({ 
      success: true, 
      message: "Profile updated successfully",
      data: fullProfile,
    });
  } catch (error) {
    console.error("Error updating engineer profile:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};



export const getEngineerDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all assignments for the engineer
    const assignments = await Assignment.find({ engineerId: userId })
    // .populate('errorDetails')  
    // .populate('fileDetails')   
    .sort({ lastUpdated: -1 }); 
    // Calculate statistics
    const stats = {
      totalAssignments: assignments.length,
      inProgress: assignments.filter(a => a.status === 'IN_PROGRESS').length,
      completed: assignments.filter(a => a.status === 'RESOLVED').length,
      pending: assignments.filter(a => a.status === 'PENDING').length,
      recentAssignments: assignments.slice(0, 5), // Get 5 most recent assignments
    };

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error("Error fetching engineer dashboard:", error);
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};  

async function getAssignedTasks(userId) {
  // Implement logic to get tasks assigned to this engineer
  return [];
}