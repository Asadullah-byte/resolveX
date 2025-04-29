import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import engineerRoutes from "./src/routes/engineerRoutes.js";
import { fileURLToPath } from "url";
import path from "path";
import { handleFileUploadErrors } from "./src/utils/fileUpload.js";
import { connectDB } from "../../db/connectDB.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

await connectDB();
// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3002",
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Routes
app.use('/api/engineer', engineerRoutes);

// Error handling middleware
app.use(handleFileUploadErrors);

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).json({ 
    success: false, 
    message: "Internal server error" 
  });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Engineer service running on port ${PORT}`);
});