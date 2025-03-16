import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

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
}


export const uploadFile = async (req, res) => {
  try {
    console.log("Received files:", req.files); 
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No files uploaded." });
    }

    const uploadedFiles = req.files.map(file => ({
      fileName: file.filename,
      filePath: file.path.replace("public/", ""),
    }));

    res.status(201).json({
      success: true,
      message: "Files uploaded successfully.",
      files: uploadedFiles,
    });

    // Automatically delete files after 7 days
    uploadedFiles.forEach(({ filePath }) => {
      setTimeout(() => {
        fs.unlink(path.join("public", filePath), (err) => {
          if (err) console.error(`Failed to delete ${filePath}:`, err);
        });
      }, 7 * 24 * 60 * 60 * 1000);
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "File upload failed.", error: error.message });
  }
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempFolderPath = path.join(__dirname, "../../public/temp");

export const uploadHistory  = async (req, res) =>{
  fs.readdir(tempFolderPath, (err, files) => {
    if (err) {
      console.error("File Read Error:", err.message);
      return res.status(500).json({ error: "Failed to read files" });
    }

    // Get file details
    const fileData = files.map((file) => {
      const filePath = path.join(tempFolderPath, file);
      const stats = fs.statSync(filePath);
      const uploadTime = stats.ctime; // File creation time

      return {
        name: file,
        status: "Completed", // Defaulting to "Completed"
        uploadTime,
      };
    });

    res.json(fileData);
  });
};
