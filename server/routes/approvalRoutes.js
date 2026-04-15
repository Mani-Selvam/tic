import express from "express";
import {
    createApproval,
    getApprovals,
} from "../controllers/approvalController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Test endpoint to verify token
router.get("/test/verify-token", auth, (req, res) => {
    console.log("Test endpoint - req.user:", req.user);
    res.json({ message: "Token verified", user: req.user });
});

// POST without auth for testing, GET with auth
router.post("/", auth, createApproval);
router.get("/", auth, getApprovals);

export default router;
