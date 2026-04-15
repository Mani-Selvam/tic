import mongoose from "mongoose";

const ApprovalSchema = new mongoose.Schema(
    {
        ticket_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ticket",
            required: true,
        },
        approver_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true, // This is set automatically in the controller
        },
        approval_status: {
            type: String,
            enum: ["Approved", "Not Approved"],
            required: true,
        },
        assigned_to: {
            // Multiselect: Array of User IDs
            type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
            default: [],
        },
        remarks: {
            type: String,
            trim: true,
        },
        approved_at: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    },
);

export default mongoose.model("Approval", ApprovalSchema);
