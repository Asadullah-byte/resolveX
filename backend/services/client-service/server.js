import express from "express";
import dotenv, { config } from "dotenv";
import cors from "cors";
import clientRoutes from "./src/routes/clientRoutes.js";
import { connectDB } from "../../db/connectDB.js";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

import cron from "node-cron";
import fs from "fs";
import path from "path";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

connectDB();

app.use(express.json()); //allows us to parse incoming requests with JSON payloads
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

app.use("/temp", express.static("public/temp"));
app.use("/client", clientRoutes);

// Auto-delete files older than 7 days
cron.schedule("0 0 * * *", () => {
  const tempDir = path.join("public", "temp");

  fs.readdir(tempDir, (err, files) => {
    if (err) return console.error("Failed to read temp directory:", err);

    files.forEach((file) => {
      const filePath = path.join(tempDir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return console.error(`Failed to read file ${filePath}:`, err);

        const now = Date.now();
        const fileAge = now - stats.mtimeMs;
        const sevenDays = 7 * 24 * 60 * 60 * 1000;

        if (fileAge > sevenDays) {
          fs.unlink(filePath, (err) => {
            if (err) console.error(`Failed to delete ${filePath}:`, err);
          });
        }
      });
    });
  });
});

console.log("Cleanup job scheduled: Files older than 7 days will be deleted daily.");


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
