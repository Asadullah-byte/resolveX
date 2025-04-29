import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getUserFileModel } from "../models/getUserFileModel.js";
import { sendToGroq } from "../services/groqService.js";
import { prisma } from "../../../../db/connectDB.js";
import dotenv from "dotenv";

dotenv.config();
export const checkAuth = async (req, res) => {
  try {
    if (req.user.role !== "Client") {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden: Client access only" });
    }
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        fname: true,
        lname: true,
        email: true,
        isVerified: true,
        role: true,
      },
    });

    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "User not found!!" });
    if (!user.isVerified)
      return res
        .status(401)
        .json({ success: false, message: "Email not verified" });

    res.status(200).json({
      success: true,
      user: { ...user, password: undefined },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const uploadFile = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No files uploaded." });
    }
    const userId = req.user.id; // UUID from JWT
    const UserFileModel = getUserFileModel(userId); // Get user-specific collection

    // Store files in MongoDB as "Pending"
    const uploadedFiles = await Promise.all(
      req.files.map(async (file) => {
        const newFile = new UserFileModel({
          fileName: file.originalname,
          filePath: `temp/${file.filename}`,
          status: "Pending",
        });
        return await newFile.save();
      })
    );

    res.status(201).json({
      success: true,
      message: "Files uploaded successfully. Processing will start.",
      files: uploadedFiles,
    });

    // Start processing if no other file is currently being processed
    const existingProcessingFile = await UserFileModel.findOne({
      status: "Processing",
    });
    if (!existingProcessingFile) {
      processNextFile(userId);
    }
  } catch (error) {
    console.error("File upload error:", error);
    res.status(500).json({
      success: false,
      message: "File upload failed.",
      error: error.message,
    });
  }
};

export const processNextFile = async (userId) => {
  try {
    const UserFileModel = getUserFileModel(userId);
    const fileToProcess = await UserFileModel.findOne({ status: "Pending" });

    if (!fileToProcess) {
      console.log("All files processed.");
      return;
    }

    fileToProcess.status = "Processing";
    await fileToProcess.save();

    const fileContent = fs.readFileSync(
      path.join("public", fileToProcess.filePath),
      "utf8"
    );
    console.log(
      "Read file content successfully:",
      fileContent.substring(0, 200)
    );

    const groqResponse = await sendToGroq(fileContent);

    fileToProcess.status = "Analyzed";
    fileToProcess.groqResponse = groqResponse;
    await fileToProcess.save();

    console.log(`File processed: ${fileToProcess.fileName}`);

    // Process the next file after a short delay
    setTimeout(processNextFile, 1000);
  } catch (error) {
    console.error("Error processing file:", error);
  }
};

export const uploadHistory = async (req, res) => {
  try {
    console.log(
      "User ID requesting history:",
      req.user.id,
      "Role:",
      req.user.role
    );

    console.log("User Role:", req.user.role);
    // Ensure only Clients can fetch their own uploaded files
    if (req.user.role !== "Client") {
      return res
        .status(403)
        .json({ error: "Unauthorized: Only Clients can access files" });
    }

    const userId = req.user.id;
    const UserFileModel = getUserFileModel(userId);

    const files = await UserFileModel.find({}, "-__v");
    res.json(files);
  } catch (error) {
    console.error("Error fetching upload history:", error);
    res.status(500).json({ error: "Failed to fetch upload history" });
  }
};

export const getAnalyzedFiles = async (req, res) => {
  try {
    console.log("🔍 Checking req.user:", req.user);

    if (!req.user) {
      return res
        .status(401)
        .json({ error: "Unauthorized - Missing user data" });
    }

    const userId = req.user.id;
    console.log("✅ Fetching files for user:", userId);

    const UserFileModel = getUserFileModel(userId);
    const files = await UserFileModel.find({ status: "Analyzed" }, "-__v");
    res.json(files);
  } catch (error) {
    console.error("Error fetching analyzed files:", error);
    res.status(500).json({ error: "Failed to fetch analyzed files" });
  }
};

export const getErrorFilesList = async (req, res) => {
  try {
    const userId = req.user.id;
    const UserFileModel = getUserFileModel(userId);

    // Get all analyzed files with minimal data
    const files = await UserFileModel.find(
      { status: "Analyzed" },
      { fileName: 1, createdAt: 1, "groqResponse.analysis_summary": 1 }
    ).sort({ createdAt: -1 });

    res.json({
      files: files.map((file) => ({
        _id: file._id,
        fileName: file.fileName,
        createdAt: file.createdAt,
        errorCount: file.groqResponse?.analysis_summary?.error_count || 0,
      })),
    });
  } catch (error) {
    console.error("Error fetching files list:", error);
    res.status(500).json({ error: "Failed to fetch files list" });
  }
};

export const getFileErrors = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "Unauthorized - Missing user data" });
    }

    const userId = req.user.id;
    const fileId = req.params.fileId;

    const UserFileModel = getUserFileModel(userId);
    const file = await UserFileModel.findById(fileId);

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    if (file.status !== "Analyzed") {
      return res.status(400).json({ error: "File not analyzed yet" });
    }

    if (!file.groqResponse?.anomalies) {
      return res.status(404).json({ error: "No anomalies found in this file" });
    }

    // Filter only errors (you might want to include warnings too)
    const errors = file.groqResponse.anomalies.filter(
      (anomaly) => anomaly.severity === "High" || anomaly.severity === "Medium"
    );

    res.json({
      fileName: file.fileName,
      totalErrors: errors.length,
      errors: errors,
      analysisDate: file.createdAt,
      summary: file.groqResponse.analysis_summary,
    });
  } catch (error) {
    console.error("Error fetching file errors:", error);
    res.status(500).json({ error: "Failed to fetch file errors" });
  }
};

// Add to clientController.js
// Add this to clientController.js
export const getEngineerRecommendations = async (req, res) => {
  try {
    const DOMAIN_HIERARCHY = {
      "Application Layer": [
        "Frontend",
        "Backend",
        "Mobile",
        "Microservices",
        "API Gateway / Middleware",
        "Business Logic",
        "Third-Party Integrations",
      ],
      "Data Layer": [
        "Database",
        "ORM / Query Builders",
        "Data Modeling / Schema Design",
        "Data Caching",
      ],
      "Identity & Access": [
        "Authentication",
        "Authorization",
        "Session Management",
        "Identity Providers",
      ],
      "Infrastructure & Networking": [
        "DevOps / Infrastructure",
        "Networking",
        "Load Balancers / Proxies",
        "CDN / Edge Services",
        "Cloud Services",
      ],
      "File & Media Handling": [
        "File System",
        "File Uploads / Downloads",
        "Media Processing",
      ],
      "Messaging & Communication": [
        "Email Services",
        "SMS / Push Notifications",
        "Message Queues / Pub-Sub",
      ],
      "Monitoring & Observability": ["Logging", "Tracing", "Metrics & Alerts"],
      "Security": [
        "Input Validation / Sanitization",
        "Rate Limiting / Throttling",
        "Encryption / Secrets Management",
        "Vulnerability Scanning",
        "Security Breach Detection",
      ],
      "Performance & Optimization": [
        "Caching",
        "Lazy Loading / Optimization",
        "Load Testing / Stress Testing",
      ],
      "Platform-Specific": [
        "OS-Level",
        "Hardware / Embedded",
        "Mobile Platform Issues",
        "Browser-Specific Bugs",
      ],
      "Testing & QA": [
        "Unit Testing",
        "Integration Testing",
        "End-to-End Testing",
        "Test Coverage Tools",
      ],
    };
    function findDomainCategory(domain) {
      for (const [category, subdomains] of Object.entries(DOMAIN_HIERARCHY)) {
        if (subdomains.some((sub) => sub.toLowerCase() === domain)) {
          return category;
        }
        if (category.toLowerCase() === domain) {
          return category;
        }
      }
      return domain; // fallback to original domain if no category found
    }
    const { domain, severity } = req.query;

    if (!domain || !severity) {
      return res.status(400).json({
        error: "Both domain and severity parameters are required",
      });
    }

    // Decode URI component for domain (handles spaces like "CoreData+Error")
    const decodedDomain = decodeURIComponent(domain).toLowerCase();
    const domainCategory = findDomainCategory(decodedDomain);

    // Get engineers with their career and education info
    const engineers = await prisma.user.findMany({
      where: {
        role: "Engineer",
        OR: [
          {
            engineer: {
              career: {
                OR: [
                  // Match exact domain
                  {
                    specialization: {
                      equals: decodedDomain,
                      mode: "insensitive",
                    },
                  },
                  // Match parent category
                  {
                    specialization: {
                      equals: domainCategory,
                      mode: "insensitive",
                    },
                  },
                  // Match in skills array
                  { skills: { hasSome: [decodedDomain, domainCategory] } },
                ],
              },
            },
          },
        ],
      },
      include: {
        engineer: {
          include: {
            career: true,
            education: true,
          },
        },
      },
    });

    // If no engineers found, return empty array
    if (!engineers || engineers.length === 0) {
      return res.json({
        internal: [],
        upwork: [],
      });
    }

    // Format the response with only necessary data
    const formattedEngineers = engineers.map((engineer) => ({
      id: engineer.id,
      userId: engineer.id,
      fname: engineer.fname,
      lname: engineer.lname,
      email: engineer.email,
      profilePic: engineer.profilePic,
      experience: engineer.engineer.career?.experience || 0,
      specialization: engineer.engineer.career?.specialization || "",
      skills: engineer.engineer.career?.skills || [],
      education: engineer.engineer.education.map((edu) => ({
        degree: edu.degree,
        major: edu.major,
        institute: edu.institute,
      })),
      source: "internal",
    }));

    res.json({
      internal: formattedEngineers,
      upwork: [],
    });
  } catch (error) {
    console.error("Error in engineer recommendations:", error);
    res.status(500).json({ error: "Failed to get engineer recommendations" });
  }
};

// Enhanced scoring algorithm based on your schema
function calculateEngineerScore(engineer, domain, severity) {
  let score = 0;
  const career = engineer.engineer?.career;
  const specialization = career?.specialization || "";

  // 1. Domain Match (50% weight)
  const decodedDomain = domain.toLowerCase();
  const domainCategory = findDomainCategory(decodedDomain);

  // Exact domain match
  if (specialization.toLowerCase() === decodedDomain) {
    score += 50;
  }
  // Parent category match
  else if (specialization.toLowerCase() === domainCategory.toLowerCase()) {
    score += 30;
  }
  // Partial match in skills
  else if (
    career?.skills?.some((skill) => skill.toLowerCase().includes(decodedDomain))
  ) {
    score += 20;
  }

  // 2. Experience (30% weight, severity-adjusted)
  const experience = career?.experience || 0;
  if (severity === "high") {
    score += Math.min(experience * 3, 30); // More weight for high severity
  } else if (severity === "medium") {
    score += Math.min(experience * 2, 30);
  } else {
    score += Math.min(experience * 1, 30);
  }

  // 3. Education Relevance (20% weight)
  const relevantEducation =
    engineer.engineer?.education?.filter(
      (edu) =>
        edu.major?.toLowerCase().includes(decodedDomain) ||
        edu.degree?.toLowerCase().includes(decodedDomain)
    ).length || 0;

  score += Math.min(relevantEducation * 5, 20); // 5% per relevant education

  return Math.min(score, 100); // Cap at 100
}

// Add to clientController.js
export const getDashboardAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const UserFileModel = getUserFileModel(userId);

    // Get all analyzed files
    const files = await UserFileModel.find({ status: "Analyzed" });

    // Process files to extract error statistics
    const fileAnalytics = files.map((file) => {
      const anomalies = file.groqResponse?.anomalies || [];

      // Count errors by severity
      const severityCounts = {
        high: anomalies.filter((a) => a.severity.toLowerCase() === "high")
          .length,
        medium: anomalies.filter((a) => a.severity.toLowerCase() === "medium")
          .length,
        low: anomalies.filter((a) => a.severity.toLowerCase() === "low").length,
        total: anomalies.length,
      };

      // Count errors by type
      const typeCounts = {};
      anomalies.forEach((anomaly) => {
        const type = anomaly.anomaly_type;
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });

      return {
        fileId: file._id,
        fileName: file.fileName,
        uploadDate: file.createdAt,
        severityCounts,
        typeCounts,
        totalErrors: anomalies.length,
      };
    });

    // Calculate overall statistics
    const overallStats = {
      totalFiles: files.length,
      totalErrors: fileAnalytics.reduce(
        (sum, file) => sum + file.totalErrors,
        0
      ),
      severityDistribution: {
        high: fileAnalytics.reduce(
          (sum, file) => sum + file.severityCounts.high,
          0
        ),
        medium: fileAnalytics.reduce(
          (sum, file) => sum + file.severityCounts.medium,
          0
        ),
        low: fileAnalytics.reduce(
          (sum, file) => sum + file.severityCounts.low,
          0
        ),
      },
      errorTypes: {},
    };

    // Aggregate error types across all files
    fileAnalytics.forEach((file) => {
      Object.entries(file.typeCounts).forEach(([type, count]) => {
        overallStats.errorTypes[type] =
          (overallStats.errorTypes[type] || 0) + count;
      });
    });

    res.json({
      success: true,
      fileAnalytics,
      overallStats,
    });
  } catch (error) {
    console.error("Error fetching dashboard analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard analytics",
      error: error.message,
    });
  }
};
