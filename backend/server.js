import express from "express";
import dotenv, { config } from "dotenv";
import cors from "cors";
import authRoutes from "./src/routes/authRoutes.js";
import { connectDB } from "./db/connectDB.js";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(express.json()); //allows us to parse incoming requests with JSON payloads
app.use(cookieParser());
app.use(cors({origin:"http://localhost:5173", credentials: true}));
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
