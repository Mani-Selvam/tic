import WorkAnalysis from "../models/WorkAnalysis.js";
import Ticket from "../models/Ticket.js";
import TicketStatus from "../models/TicketStatus.js";
import mongoose from "mongoose";

// @desc    Create or Update Work Analysis (Worker Submit)
// @route   POST /api/work-analysis
// @Access  Private (Worker)
export const createWorkAnalysis = async (req, res) => {
    try {
        // req.files comes from multer (array of files)
        const imagePaths = req.files ? req.files.map((file) => file.path) : [];

        const {
            ticket_id,
            material_required,
            material_description,
            worker_id,
            worker_name,
        } = req.body;

        // Log incoming request data
        console.log("🔵🔵🔵 Work Analysis Creation/Update Request Received");
        console.log("   req.files:", req.files);
        console.log("   req.files length:", req.files?.length);
        console.log("   imagePaths:", imagePaths);
        console.log("   imagePaths length:", imagePaths.length);
        console.log("   Raw req.body:", req.body);
        console.log("   Extracted material_required:", material_required);
        console.log("   Material Required Type:", typeof material_required);
        console.log("   Material Required === 'No'?", material_required === "No");
        console.log("   Material Required === 'Yes'?", material_required === "Yes");
        console.log("   Extracted ticket_id:", ticket_id);
        console.log("   Extracted worker_id:", worker_id);
        console.log("   Extracted worker_name:", worker_name);

        // Use worker_id from request body or fallback to authenticated user
        const finalWorkerId = worker_id || req.user.id;

        if (!finalWorkerId) {
            return res.status(400).json({ message: "Worker ID is required" });
        }

        // Ensure ticket_id is an ObjectId for comparison
        let ticketObjectId;
        try {
            ticketObjectId = mongoose.Types.ObjectId.isValid(ticket_id) 
                ? new mongoose.Types.ObjectId(ticket_id)
                : ticket_id;
        } catch (err) {
            ticketObjectId = ticket_id;
        }

        // Check if work analysis already exists for this ticket
        const existingAnalysis = await WorkAnalysis.findOne({ ticket_id: ticketObjectId });
        
        console.log("🔍 Searching for existing analysis with ticket_id:", ticket_id);
        console.log("📊 Found existing analysis:", existingAnalysis ? existingAnalysis._id : "None");
        
        let savedAnalysis;
        if (existingAnalysis) {
            // UPDATE existing analysis
            console.log("🔄 Updating existing Work Analysis:", existingAnalysis._id);
            
            // Merge old images with new images if any
            const updatedImages = imagePaths.length > 0 
                ? imagePaths 
                : existingAnalysis.uploaded_images;
            
            savedAnalysis = await WorkAnalysis.findByIdAndUpdate(
                existingAnalysis._id,
                {
                    material_required,
                    uploaded_images: updatedImages,
                    material_description:
                        material_required === "Yes" ? material_description : "",
                    worker_name: worker_name || existingAnalysis.worker_name,
                    updated_at: new Date(), // Update timestamp
                },
                { new: true }
            ).populate("approved_by", "name email");
            
            console.log("🟢 Work Analysis Updated:", savedAnalysis);
        } else {
            // CREATE new analysis
            console.log("✨ Creating new Work Analysis");
            console.log("📸 Creating with uploaded_images:", imagePaths);
            console.log("📸 uploaded_images length:", imagePaths.length);
            
            const analysis = new WorkAnalysis({
                analysis_id: "WA-" + Date.now().toString().slice(-6),
                ticket_id: ticketObjectId,
                worker_id: finalWorkerId,
                worker_name: worker_name || "Unknown",
                material_required,
                uploaded_images: imagePaths,
                material_description:
                    material_required === "Yes" ? material_description : "",
                approval_status: "Pending",
            });

            console.log("📸 About to save analysis with uploaded_images:", imagePaths);
            console.log("📸 Analysis object before save:", {
                analysis_id: analysis.analysis_id,
                material_required: analysis.material_required,
                uploaded_images: analysis.uploaded_images,
                uploaded_images_length: analysis.uploaded_images.length,
            });
            
            savedAnalysis = await analysis.save();
            await savedAnalysis.populate("approved_by", "name email");
            console.log("🟢 Work Analysis Created:", savedAnalysis);
            console.log("🟢 Saved material_required value:", savedAnalysis.material_required);
            console.log("🟢 Saved material_required type:", typeof savedAnalysis.material_required);
            console.log("🟢 Saved uploaded_images:", savedAnalysis.uploaded_images);
            console.log("🟢 Saved uploaded_images length:", savedAnalysis.uploaded_images?.length);
        }

        // Update ticket status based on material_required
        try {
            const statusMapping = {
                "Yes": "Material Request",
                "No": "Material Approved"
            };
            const newStatusName = statusMapping[material_required];
            
            console.log("🔵 Updating ticket status - Material Required:", material_required);
            console.log("🔵 New Status Name:", newStatusName);
            console.log("🔵 Ticket ID:", ticket_id);
            
            if (newStatusName && ticket_id) {
                // Find or create the TicketStatus
                let ticketStatus = await TicketStatus.findOne({ name: newStatusName });
                
                if (!ticketStatus) {
                    console.log("🟡 TicketStatus not found, creating it...");
                    // Create the status if it doesn't exist
                    try {
                        const maxOrder = await TicketStatus.findOne().sort({ sortOrder: -1 });
                        const nextOrder = (maxOrder?.sortOrder || 0) + 1;
                        ticketStatus = await TicketStatus.create({
                            name: newStatusName,
                            sortOrder: nextOrder,
                            status: "Active"
                        });
                        console.log("🟢 TicketStatus created:", ticketStatus);
                    } catch (createErr) {
                        console.error("🔴 Failed to create TicketStatus:", createErr.message);
                    }
                }
                
                if (ticketStatus) {
                    // Update both status (string) and status_id (reference)
                    const updatedTicket = await Ticket.findByIdAndUpdate(
                        ticket_id,
                        { 
                            status: newStatusName,
                            status_id: ticketStatus._id
                        },
                        { new: true }
                    ).populate("status_id", "name");
                    console.log("🟢 Ticket updated successfully:", updatedTicket);
                } else {
                    console.log("🟡 TicketStatus not found and could not be created, updating with string only");
                    // Fallback: just update status field if TicketStatus not found
                    const updatedTicket = await Ticket.findByIdAndUpdate(
                        ticket_id,
                        { status: newStatusName },
                        { new: true }
                    );
                    console.log("🟡 Ticket updated (fallback):", updatedTicket);
                }
            }
        } catch (ticketUpdateError) {
            console.error("🔴 Error updating ticket status:", ticketUpdateError.message);
            console.error("Stack:", ticketUpdateError.stack);
            // Continue even if ticket update fails
        }

        // Try to attach worker's name for frontend convenience
        try {
            const User = (await import("../models/User.js")).default;
            const worker = await User.findById(finalWorkerId).select("name");
            const out = savedAnalysis.toObject ? savedAnalysis.toObject() : savedAnalysis;
            out.worker_name = worker ? worker.name : finalWorkerId;
            
            // Convert relative image paths to full URLs
            const apiUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 5000}`;
            if (out.uploaded_images && Array.isArray(out.uploaded_images)) {
                out.uploaded_images = out.uploaded_images.map(img => 
                    img && !img.startsWith("http") ? `${apiUrl}/${img}` : img
                );
            }
            
            const statusCode = existingAnalysis ? 200 : 201;
            return res.status(statusCode).json(out);
        } catch (e) {
            // If lookup fails, still return the saved analysis
            const out = savedAnalysis.toObject ? savedAnalysis.toObject() : savedAnalysis;
            
            // Convert relative image paths to full URLs
            const apiUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 5000}`;
            if (out.uploaded_images && Array.isArray(out.uploaded_images)) {
                out.uploaded_images = out.uploaded_images.map(img => 
                    img && !img.startsWith("http") ? `${apiUrl}/${img}` : img
                );
            }
            
            const statusCode = existingAnalysis ? 200 : 201;
            return res.status(statusCode).json(out);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Approval Status (Manager Action)
// @route   PUT /api/work-analysis/:id/approve
export const updateApproval = async (req, res) => {
    try {
        const { approval_status } = req.body;

        const analysis = await WorkAnalysis.findById(req.params.id);
        if (!analysis)
            return res.status(404).json({ message: "Analysis not found" });

        analysis.approval_status = approval_status;
        analysis.approved_by = req.user.id;
        analysis.approved_at = Date.now();

        await analysis.save();

        // When approved → update ticket status to "Material Approved"
        if (approval_status === "Approved" && analysis.ticket_id) {
            try {
                const materialApprovedStatus = await TicketStatus.findOne({
                    name: { $regex: "Material Approved", $options: "i" },
                });
                if (materialApprovedStatus) {
                    await Ticket.findByIdAndUpdate(
                        analysis.ticket_id,
                        { status_id: materialApprovedStatus._id, status: "Material Approved" },
                        { new: true }
                    );
                    console.log(`✅ Ticket ${analysis.ticket_id} status updated to Material Approved`);
                }
            } catch (ticketUpdateErr) {
                console.error("Error updating ticket status on approval:", ticketUpdateErr.message);
            }
        }

        // Convert relative image paths to full URLs
        const out = analysis.toObject ? analysis.toObject() : analysis;
        const apiUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 5000}`;
        if (out.uploaded_images && Array.isArray(out.uploaded_images)) {
            out.uploaded_images = out.uploaded_images.map(img =>
                img && !img.startsWith("http") ? `${apiUrl}/${img}` : img
            );
        }

        res.status(200).json(out);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get All Analysis
// @route   GET /api/work-analysis
export const getWorkAnalysis = async (req, res) => {
    try {
        const analyses = await WorkAnalysis.find()
            .populate("ticket_id", "ticket_id title")
            .populate("approved_by", "name email")
            .sort({ createdAt: -1 });

        // Collect unique worker IDs and fetch their names (worker_id stored as string)
        const workerIds = Array.from(
            new Set(analyses.map((a) => a.worker_id).filter(Boolean)),
        );

        let usersMap = {};
        if (workerIds.length > 0) {
            try {
                const User = (await import("../models/User.js")).default;
                const users = await User.find({ _id: { $in: workerIds } }).select(
                    "name",
                );
                usersMap = users.reduce((acc, u) => {
                    acc[u._id] = u.name;
                    return acc;
                }, {});
            } catch (e) {
                // ignore user lookup failures
            }
        }

        const result = analyses.map((a) => {
            const obj = a.toObject ? a.toObject() : a;
            obj.worker_name = usersMap[obj.worker_id] || obj.worker_name || obj.worker_id;
            
            // Convert relative image paths to full URLs
            const apiUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 5000}`;
            if (obj.uploaded_images && Array.isArray(obj.uploaded_images)) {
                obj.uploaded_images = obj.uploaded_images.map(img => 
                    img && !img.startsWith("http") ? `${apiUrl}/${img}` : img
                );
            }
            
            return obj;
        });

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
