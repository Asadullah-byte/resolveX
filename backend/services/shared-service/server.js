import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import sharedRoutes from "./src/routes/sharedRoutes.js";
import { connectDB } from "../../db/connectDB.js";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import githubAuthRoutes from './src/routes/githubAuth.routes.js';
;



dotenv.config();
const app = express();
const PORT = process.env.PORT || 3003;

connectDB();

app.use(express.json()); //allows us to parse incoming requests with JSON payloads
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});


app.use("/shared", sharedRoutes);
app.use("/auth", githubAuthRoutes);


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
  
  
  
  
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
  