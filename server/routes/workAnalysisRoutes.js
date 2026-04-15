import express from "express";
import {
    createWorkAnalysis,
    updateApproval,
    getWorkAnalysis,
} from "../controllers/workAnalysisController.js";
import { auth } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// @route   GET /api/work-analysis/worker
// @desc    Get Work Analysis for Current Worker Only
// @Access  Private
router.get("/worker", auth, async (req, res) => {
    try {
        const workerId = req.user.id;
        console.log("Fetching work analysis for worker:", workerId);

        // Import WorkAnalysis model to query directly
        const WorkAnalysis = (await import("../models/WorkAnalysis.js")).default;
        
        // Find work analyses where worker_id matches current user
        const analyses = await WorkAnalysis.find({ worker_id: workerId })
            .populate("ticket_id", "ticket_id title")
            .populate("worker_id", "name email")
            .populate("approved_by", "name email")
            .sort({ createdAt: -1 });

        res.json(analyses);
    } catch (error) {
        console.error("Error fetching worker work analysis:", error);
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/work-analysis/approved
// @desc    Get Material Approved Work Analysis (where ticket status is "Material Approved")
// @Access  Private
router.get("/approved", auth, async (req, res) => {
    try {
        console.log("🟢 Fetching Material Approved work analyses (ticket status = 'Material Approved')");

        // Import models
        const WorkAnalysis = (await import("../models/WorkAnalysis.js")).default;
        const User = (await import("../models/User.js")).default;
        const Ticket = (await import("../models/Ticket.js")).default;
        
        // First, find all tickets with "Material Approved" status
        const materialApprovedStatus = await (await import("../models/TicketStatus.js")).default.findOne({ 
            name: { $regex: "Material Approved", $options: "i" } 
        });
        
        console.log(`📊 Material Approved Status:`, materialApprovedStatus);
        
        // Find tickets with Material Approved status
        const materialApprovedTickets = materialApprovedStatus 
            ? await Ticket.find({ status_id: materialApprovedStatus._id }).select("_id")
            : [];
        
        console.log(`📊 Found ${materialApprovedTickets.length} tickets with Material Approved status`);
        
        const ticketIds = materialApprovedTickets.map(t => t._id);
        
        // Find work analyses for these tickets
        let analyses = await WorkAnalysis.find({ ticket_id: { $in: ticketIds } })
            .populate({
                path: "ticket_id",
                select: "ticket_id title status_id",
                populate: {
                    path: "status_id",
                    select: "name sortOrder"
                }
            })
            .populate("approved_by", "name email")
            .sort({ created_at: -1, _id: -1 });

        console.log(`📊 Found ${analyses.length} Material Approved records before enrichment`);

        // For each analysis, if worker_name is missing, try to get it from User model
        const enrichedAnalyses = await Promise.all(
            analyses.map(async (analysis) => {
                const analysisObj = analysis.toObject();
                
                console.log(`🔍 Processing analysis ${analysisObj.analysis_id}: worker_name="${analysisObj.worker_name}", worker_id="${analysisObj.worker_id}"`);
                
                // If worker_name is missing or empty, try to fetch from User model using worker_id
                if (!analysisObj.worker_name || analysisObj.worker_name === "" || analysisObj.worker_name === "Unknown") {
                    try {
                        // Try finding user by the worker_id (could be string or ObjectId)
                        let user = null;
                        
                        // First try direct ID match
                        try {
                            user = await User.findById(analysisObj.worker_id);
                        } catch (e) {
                            console.log(`⚠️  Direct user lookup failed for ${analysisObj.worker_id}`);
                        }
                        
                        // If not found, try matching as string
                        if (!user) {
                            user = await User.findOne({ _id: analysisObj.worker_id }).select("name");
                        }
                        
                        if (user && user.name) {
                            analysisObj.worker_name = user.name;
                            console.log(`✅ Found worker name from User model: ${user.name} for worker_id: ${analysisObj.worker_id}`);
                        } else {
                            console.log(`❌ User not found for worker_id: ${analysisObj.worker_id}`);
                            analysisObj.worker_name = analysisObj.worker_name || "Unknown Worker";
                        }
                    } catch (err) {
                        console.error(`❌ Error enriching worker name for ${analysisObj.analysis_id}:`, err.message);
                        analysisObj.worker_name = analysisObj.worker_name || "Unknown Worker";
                    }
                } else {
                    console.log(`✅ Worker name already present: ${analysisObj.worker_name}`);
                }
                
                return analysisObj;
            })
        );

        console.log(`✅ Found ${enrichedAnalyses.length} Material Approved records after enrichment`);
        
        // Log each record's uploaded_images for debugging
        enrichedAnalyses.forEach((analysis, idx) => {
            console.log(`   Record ${idx}: analysis_id=${analysis.analysis_id}, uploaded_images=${JSON.stringify(analysis.uploaded_images)}`);
        });
        
        res.json(enrichedAnalyses);
    } catch (error) {
        console.error("❌ Error fetching Material Approved work analysis:", error);
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/work-analysis
// @desc    Create Work Analysis (Worker Submit)
// @Access  Private
router.post("/", auth, upload.array("images", 5), (req, res, next) => {
    console.log("🔵 POST /api/work-analysis - After Multer Processing");
    console.log("   req.files:", req.files);
    console.log("   req.files length:", req.files?.length);
    console.log("   req.files details:", req.files?.map(f => ({ fieldname: f.fieldname, originalname: f.originalname, path: f.path })));
    next();
}, createWorkAnalysis);

// @route   GET /api/work-analysis
// @desc    Get All Work Analysis
// @Access  Private
router.get("/", auth, getWorkAnalysis);

// @route   PUT /api/work-analysis/:id/approve
// @desc    Update Approval Status (Manager Action)
// @Access  Private
router.put("/:id/approve", auth, updateApproval);

// @route   PUT /api/work-analysis/:id
// @desc    Update Work Analysis (e.g., material_required status)
// @Access  Private
router.put("/:id", auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { material_required } = req.body;

        // Import WorkAnalysis model
        const WorkAnalysis = (await import("../models/WorkAnalysis.js")).default;

        // Find and update the work analysis
        const analysis = await WorkAnalysis.findByIdAndUpdate(
            id,
            { material_required },
            { new: true, runValidators: true }
        );

        if (!analysis) {
            return res.status(404).json({ message: "Work analysis not found" });
        }

        console.log(`✅ Updated work analysis ${id}: material_required = ${material_required}`);
        res.json(analysis);
    } catch (error) {
        console.error("Error updating work analysis:", error);
        res.status(500).json({ message: error.message });
    }
});

export default router;
