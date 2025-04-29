// signaling-server/index.js
import { Server } from "socket.io";
import http from "http";
import express from "express";
import cors from "cors";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Replace with frontend URL(s) in production
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  socket.on("join-room", ({ roomId, userId }) => {
    socket.join(roomId);
    console.log(`👥 ${userId} joined room ${roomId}`);
    socket.to(roomId).emit("user-joined", { userId });
  });

  socket.on("offer", ({ roomId, offer }) => {
    socket.to(roomId).emit("offer", offer);
  });

  socket.on("answer", ({ roomId, answer }) => {
    socket.to(roomId).emit("answer", answer);
  });

  socket.on("ice-candidate", ({ roomId, candidate }) => {
    socket.to(roomId).emit("ice-candidate", candidate);
  });

  socket.on("end-call", ({ roomId }) => {
    socket.to(roomId).emit("end-call");
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`📡 Signaling server listening on port ${PORT}`);
});
