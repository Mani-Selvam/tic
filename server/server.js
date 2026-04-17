import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import priorityRoutes from "./routes/priorityRoutes.js";
import designationRoutes from "./routes/designationRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import ticketStatusRoutes from "./routes/ticketStatusRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import ticketRoutes from "./routes/tickets.js";
import approvalRoutes from "./routes/approvalRoutes.js";
import workAnalysisRoutes from "./routes/workAnalysisRoutes.js";
import workLogRoutes from "./routes/workLogRoutes.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import connectDB from "./db.js";
import companyRoutes from "./routes/companyRoutes.js";
import TicketStatus from "./models/TicketStatus.js";

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(
    cors({
        origin: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    }),
);

// app.options("*", cors()); // Removed to fix path-to-regexp error

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
    const distPath = path.join(__dirname, "../dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
    });
} else {
    app.get("/", (req, res) => {
        res.set("Content-Type", "text/html; charset=utf-8");
        res.send("<h2>API is running successfully</h2>");
    });
}

// Routes
app.use("/api/companies", companyRoutes);
app.use("/api/priorities", priorityRoutes);
app.use("/api/designations", designationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/ticket-status", ticketStatusRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/approvals", approvalRoutes);
app.use("/api/work-analysis", workAnalysisRoutes);
app.use("/api/work-logs", workLogRoutes);
const PORT = process.env.PORT || 3000;
const HOST = process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1";
app.listen(PORT, HOST, () => console.log(`Server running on port ${PORT}`));
