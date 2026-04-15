import express from "express";
import multer from "multer";
import path from "path";
import Ticket from "../models/Ticket.js";
import TicketStatus from "../models/TicketStatus.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(
            null,
            file.fieldname +
                "-" +
                uniqueSuffix +
                path.extname(file.originalname),
        );
    },
});

const upload = multer({ storage });

// GET TICKETS ASSIGNED TO WORKER ONLY - Protected Route (MUST BE BEFORE /:id ROUTE)
router.get("/worker/assigned", auth, async (req, res) => {
    try {
        const workerId = (req.user.user && req.user.user.id) || req.user.id; // Get worker ID from JWT token
        console.log("🔍 [WORKER TICKETS] Worker ID from token:", workerId);
        console.log("🔍 [WORKER TICKETS] Worker ID type:", typeof workerId);

        // Find all tickets where this worker is in the assigned_to array
        const tickets = await Ticket.find({
            assigned_to: { $elemMatch: { $eq: workerId } },
        })
            .populate("raised_by", "name email mobile")
            .populate("department_id", "name")
            .populate("company_id", "name")
            .populate("priority_id", "name")
            .populate("status_id", "name")
            .populate("assigned_to", "name email")
            .populate("approver_id", "name email")
            .sort({ createdAt: -1 });

        console.log(`✅ [WORKER TICKETS] Found ${tickets.length} tickets for worker ${workerId}`);
        
        // Debug: show all tickets with their assigned workers
        const allTickets = await Ticket.find({})
            .select("ticket_id title assigned_to")
            .populate("assigned_to", "_id name");
        
        console.log("🔍 [WORKER TICKETS] All tickets in DB:");
        allTickets.forEach(t => {
            const assignedIds = t.assigned_to?.map(a => a._id?.toString()) || [];
            const isAssignedToWorker = assignedIds.includes(workerId);
            console.log(`  - ${t.ticket_id}: assigned=${assignedIds}, match=${isAssignedToWorker}`);
        });
        
        res.json(tickets);
    } catch (error) {
        console.error("❌ [WORKER TICKETS] Error fetching worker tickets:", error);
        res.status(500).json({ message: error.message });
    }
});

// GET SINGLE TICKET FOR WORKER - Protected Route (MUST BE BEFORE /:id ROUTE)
router.get("/worker/:ticketId", auth, async (req, res) => {
    try {
        const workerId = (req.user.user && req.user.user.id) || req.user.id;
        const { ticketId } = req.params;

        const ticket = await Ticket.findById(ticketId)
            .populate("raised_by", "name email mobile")
            .populate("department_id", "name")
            .populate("company_id", "name")
            .populate("priority_id", "name")
            .populate("status_id", "name")
            .populate("assigned_to", "name email")
            .populate("approver_id", "name email");

        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        // Check if worker is assigned to this ticket
        const isAssigned = ticket.assigned_to.some(
            (assignee) => String(assignee._id) === String(workerId)
        );

        if (!isAssigned) {
            return res
                .status(403)
                .json({ message: "You are not assigned to this ticket" });
        }

        res.json(ticket);
    } catch (error) {
        console.error("Error fetching worker ticket detail:", error);
        res.status(500).json({ message: error.message });
    }
});

// GET ALL TICKETS - with optional filtering
router.get("/", async (req, res) => {
    try {
        const { status, priority, department_id, raised_by } = req.query;
        const filter = {};

        // Build dynamic filter based on query parameters
        if (status) filter.status = status;
        if (priority) filter.priority = priority;
        if (department_id) filter.department_id = department_id;
        if (raised_by) filter.raised_by = raised_by;

        const tickets = await Ticket.find(filter)
            .populate("raised_by", "name email mobile")
            .populate("department_id", "name")
            .populate("company_id", "name")
            .populate("priority_id", "name")
            .populate("status_id", "name")
            .populate("assigned_to", "name email")
            .populate("approver_id", "name email")
            .sort({ createdAt: -1 });

        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET TICKETS BY STATUS - Must come before /:id
router.get("/status/:status", async (req, res) => {
    try {
        const tickets = await Ticket.find({ status: req.params.status })
            .populate("raised_by", "name email mobile")
            .populate("department_id", "name")
            .populate("company_id", "name")
            .populate("priority_id", "name")
            .populate("status_id", "name")
            .populate("assigned_to", "name email")
            .populate("approver_id", "name email")
            .populate("status_id", "name")
            .sort({ createdAt: -1 });

        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET TICKETS BY PRIORITY - Must come before /:id
router.get("/priority/:priority", async (req, res) => {
    try {
        const tickets = await Ticket.find({ priority: req.params.priority })
            .populate("raised_by", "name email mobile")
            .populate("department_id", "name")
            .populate("company_id", "name")
            .populate("priority_id", "name")
            .populate("status_id", "name")
            .populate("assigned_to", "name email")
            .populate("approver_id", "name email")
            .sort({ createdAt: -1 });

        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET SINGLE TICKET - After specific routes
router.get("/:id", async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate("raised_by", "name email mobile")
            .populate("department_id", "name")
            .populate("company_id", "name")
            .populate("priority_id", "name")
            .populate("status_id", "name")
            .populate("assigned_to", "name email")
            .populate("approver_id", "name email");

        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }
        res.json(ticket);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// CREATE TICKET
router.post("/", upload.single("image"), async (req, res) => {
    try {
        console.log("Received ticket creation request");
        console.log("req.body:", req.body);
        console.log("req.file:", req.file);

        const {
            title,
            description,
            priority_id,
            status_id,
            company_id,
            department_id,
            raised_by,
            location,
        } = req.body;

        // Validate required fields
        if (!title || !description || !department_id || !raised_by) {
            console.log("Validation failed:", {
                title: !!title,
                description: !!description,
                department_id: !!department_id,
                raised_by: !!raised_by,
            });
            return res.status(400).json({
                message:
                    "Missing required fields: title, description, department_id, raised_by",
            });
        }

        console.log("Creating new ticket with data:", {
            title,
            description,
            priority_id,
            status_id,
            company_id,
            department_id,
            raised_by,
            location,
        });

        const imagePath = req.file ? req.file.path.replace(/\\/g, "/") : null;

        const newTicket = new Ticket({
            title,
            description,
            priority_id: priority_id || null,
            status_id: status_id || null,
            company_id: company_id || null,
            department_id,
            raised_by,
            image: imagePath,
            location: location || null,
        });

        const savedTicket = await newTicket.save();
        const populatedTicket = await savedTicket.populate([
            { path: "raised_by", select: "name email mobile" },
            { path: "department_id", select: "name" },
            { path: "company_id", select: "name" },
            { path: "priority_id", select: "name" },
            { path: "status_id", select: "name" },
        ]);

        res.status(201).json(populatedTicket);
    } catch (error) {
        console.error("Ticket creation error:", error);
        res.status(400).json({ message: error.message });
    }
});

// UPDATE TICKET
router.put("/:id", async (req, res) => {
    try {
        const {
            title,
            description,
            priority_id,
            status_id,
            status,
            image,
            approval_status,
            assigned_to,
            approver_id,
            approved_at,
            closed_at,
            location,
        } = req.body;

        // If status_id is provided, fetch the status name and update both status_id and status
        let updateData = {
            ...(title && { title }),
            ...(description && { description }),
            ...(priority_id && { priority_id }),
            ...(status_id && { status_id }),
            ...(status && { status }),
            ...(image && { image }),
            ...(approval_status && { approval_status }),
            ...(assigned_to && { assigned_to }),
            ...(approver_id && { approver_id }),
            ...(approved_at && { approved_at }),
            ...(closed_at !== undefined && { closed_at: closed_at ? new Date(closed_at) : null }),
            ...(location !== undefined && { location: location || null }),
        };

        // If status_id is provided but status string is not, fetch the status name from the database
        if (status_id && !status) {
            const statusObj = await TicketStatus.findById(status_id);
            if (statusObj) {
                updateData.status = statusObj.name;
            }
        }

        const updatedTicket = await Ticket.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true },
        )
            .populate("raised_by", "name email mobile")
            .populate("department_id", "name")
            .populate("company_id", "name")
            .populate("priority_id", "name")
            .populate("status_id", "name")
            .populate("assigned_to", "name email")
            .populate("approver_id", "name email");

        if (!updatedTicket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        res.json(updatedTicket);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE TICKET
router.delete("/:id", async (req, res) => {
    try {
        const ticket = await Ticket.findByIdAndDelete(req.params.id);

        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        res.json({
            message: "Ticket deleted successfully",
            deletedTicket: ticket,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
