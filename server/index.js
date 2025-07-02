import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import authRoutes from "./routes/AuthRoutes.js";
import contactsRoutes from "./routes/ContactRoutes.js";
import messagesRoutes from "./routes/MessagesRoute.js";
import setupSocket from "./socket.js";
import channelRoutes from "./routes/ChannelRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const DATABASE_URL = process.env.DATABASE_URL;
const CLIENT_ORIGIN = process.env.ORIGIN; 

// === CORS Setup ===
app.use(cors({
  origin: [CLIENT_ORIGIN, "https://chat-application-eight-phi.vercel.app"], // Add local dev frontend if needed(e.,g,http://localhost:5173)
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true,
}));

// === Middlewares ===
app.use(cookieParser());
app.use(express.json());

// === Static Files ===
app.use("/uploads/profiles", express.static("uploads/profiles"));
app.use("/uploads/files", express.static("uploads/files"));

// === Routes ===
app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/channel", channelRoutes);

// === Root route to confirm server is working ===
app.get("/", (req, res) => {
  res.send("✅ Backend is working!");
});

// === Server Start ===
const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});

// === Socket Setup ===
setupSocket(server);

// === DB Connection ===
mongoose.connect(DATABASE_URL)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
  });
