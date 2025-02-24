import express from "express";
import dotenv, { config } from "dotenv";
import cors from "cors";
import authRoutes from "./src/routes/authRoutes.js";
import { connectDB } from "./db/connectDB.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(express.json()); //allows us to parse incoming requests with JSON payloads

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
