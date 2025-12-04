import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import clientRoutes from "./src/routes/clientRoutes.js";
import { connectDB } from "../../db/connectDB.js";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import cron from "node-cron";
import fs from "fs";
import http from "http";
import { Server } from "socket.io";


dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json()); //allows us to parse incoming requests with JSON payloads
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

app.use("/public/temp", express.static(path.join(__dirname, "public/temp")));
app.use("/client", clientRoutes);


const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// 🌍 Make it globally accessible
global.io = io;

// 🧠 Setup socket listeners
io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId); // Join personal room
    console.log(`User ${userId} joined their socket room`);
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

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

io.on("connection", (socket) => {
  socket.on("join", (room) => {
    socket.join(room);
  });

  socket.on("chat:typing", ({ room, name }) => {
    socket.to(room).emit("chat:message", {
      typing: true,
      name,
    });
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});




console.log(
  "Cleanup job scheduled: Files older than 7 days will be deleted daily."
);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
