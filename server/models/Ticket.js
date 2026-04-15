import mongoose from "mongoose";

const TicketSchema = new mongoose.Schema(
    {
        ticket_id: {
            type: String,
            unique: true,
            required: false,
            index: true,
        },
        company_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: false,
        },
        department_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            required: true,
        },
        raised_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        image: {
            type: String, // Stores the file path (e.g., "uploads/image-123.jpg")
            default: null,
        },
        priority: {
            type: String,
            required: false,
            default: null,
        },
        priority_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Priority",
            required: false,
        },
        status: {
            type: String,
            required: false,
            default: null,
        },
        status_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "TicketStatus",
            required: false,
        },
        closed_at: {
            type: Date,
            default: null,
        },
        approval_status: {
            type: String,
            enum: ["Approved", "Not Approved", "Pending"],
            default: "Pending",
        },
        assigned_to: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "User",
            default: [],
        },
        approver_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        approved_at: {
            type: Date,
            default: null,
        },
        location: {
            type: String,
            required: false,
            default: null,
            trim: true,
        },
    },
    {
        timestamps: true, // Automatically handles created_at and updated_at
    },
);

// --- HOOKS ---

// Combine all pre-save logic into a single async hook
TicketSchema.pre("save", async function () {
    // 1. Auto-Generate ticket_id before saving if not provided
    if (!this.ticket_id) {
        // Example: TKT + Timestamp
        this.ticket_id =
            "TKT-" +
            Date.now().toString().slice(-6) +
            Math.floor(Math.random() * 100);
    }

    // Don't call next() - just return from async function
});

export default mongoose.model("Ticket", TicketSchema);
