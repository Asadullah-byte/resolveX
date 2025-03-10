import fs from "fs";
import path from "path";

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
    console.log("Received file:", req.file); 
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded." });
    }

    const filePath = path.join(req.file.destination, req.file.filename);

    res.status(201).json({
      success: true,
      message: "File uploaded successfully.",
      filePath: filePath.replace("public/", ""), // Return relative path for frontend
    });

    // Automatically delete file after 7 days
    setTimeout(() => {
      fs.unlink(filePath, (err) => {
        if (err) console.error(`Failed to delete ${filePath}:`, err);
      });
    }, 7 * 24 * 60 * 60 * 1000); // 7 days in milliseconds

  } catch (error) {
    res.status(500).json({ success: false, message: "File upload failed.", error: error.message });
  }
};
