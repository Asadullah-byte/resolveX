import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { UploadedFile } from "../models/uploadedFile.js";
import { sendToGroq } from "../services/groqService.js";
import { prisma } from "../../../../db/connectDB.js";
import dotenv from "dotenv";


dotenv.config();
export const checkAuth = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

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

    // Store files in MongoDB as "Pending"
    const uploadedFiles = await Promise.all(
      req.files.map(async (file) => {
        const newFile = new UploadedFile({
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
    const existingProcessingFile = await UploadedFile.findOne({
      status: "Processing",
    });
    if (!existingProcessingFile) {
      processNextFile();
    }
  } catch (error) {
    console.error("File upload error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "File upload failed.",
        error: error.message,
      });
  }
};

export const processNextFile = async () => {
  try {
    const fileToProcess = await UploadedFile.findOne({ status: "Pending" });

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
    const files = await UploadedFile.find({}, "-__v");
    res.json(files);
  } catch (error) {
    console.error("Error fetching upload history:", error);
    res.status(500).json({ error: "Failed to fetch upload history" });
  }
};

export const getAnalyzedFiles = async (req, res) => {
  try {
    const files = await UploadedFile.find({ status: "Analyzed" }, "-__v");
    res.json(files);
  } catch (error) {
    console.error("Error fetching analyzed files:", error);
    res.status(500).json({ error: "Failed to fetch analyzed files" });
  }
};

