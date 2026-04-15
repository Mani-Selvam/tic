import express from "express";
import {
    createWorkLog,
    getWorkLogsByTicket,
    getWorkLogsByAnalysis,
    deleteWorkLog,
} from "../controllers/workLogController.js";

const router = express.Router();

// Create a new work log
router.post("/", createWorkLog);

// Get work logs by ticket ID
router.get("/ticket/:ticketId", getWorkLogsByTicket);

// Get work logs by analysis ID
router.get("/analysis/:analysisId", getWorkLogsByAnalysis);

// Delete work log
router.delete("/:workLogId", deleteWorkLog);

export default router;
