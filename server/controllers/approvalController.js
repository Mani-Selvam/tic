import Approval from "../models/Approval.js";

// @desc    Create or Update Approval
// @route   POST /api/approvals
export const createApproval = async (req, res) => {
    try {
        console.log("Create Approval - req.user:", req.user); // Debug
        console.log("Create Approval - req.body:", req.body); // Debug

        const {
            ticket_id,
            approval_status,
            assigned_to,
            remarks,
            approved_at,
        } = req.body;

        // Auto Capture Approver (Logged in User)
        // Note: req.user is set by auth middleware from JWT payload
        if (!req.user || !req.user.user || !req.user.user.id) {
            console.error(
                "Create Approval - User not authenticated properly:",
                req.user,
            );
            return res.status(401).json({ message: "User not authenticated" });
        }

        const approver_id = req.user.user.id;
        console.log("Create Approval - approver_id:", approver_id); // Debug

        // assigned_to comes from frontend as an array of IDs (strings or objects)
        // Ensure it is an array
        const assignedUsers = Array.isArray(assigned_to)
            ? assigned_to
            : [assigned_to];

        const approval = new Approval({
            ticket_id,
            approver_id,
            approval_status,
            assigned_to: assignedUsers,
            remarks,
            approved_at: approved_at || new Date(),
        });

        const savedApproval = await approval.save();

        // Optional: Populate user details for the response
        await savedApproval.populate("assigned_to", "name email");
        await savedApproval.populate("approver_id", "name email");

        res.status(201).json(savedApproval);
    } catch (error) {
        console.error("Create Approval - Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Approvals
// @route   GET /api/approvals
export const getApprovals = async (req, res) => {
    try {
        const approvals = await Approval.find()
            .populate("ticket_id", "ticket_id title status")
            .populate("assigned_to", "name email")
            .populate("approver_id", "name")
            .sort({ createdAt: -1 });

        res.status(200).json(approvals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
