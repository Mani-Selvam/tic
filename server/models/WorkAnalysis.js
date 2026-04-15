import mongoose from "mongoose";

const WorkAnalysisSchema = new mongoose.Schema({
    analysis_id: {
        type: String,
        unique: true,
        index: true,
    },
    ticket_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ticket",
        required: true,
    },
    worker_id: {
        type: String,
        required: true,
    },
    worker_name: {
        type: String,
        trim: true,
    },
    material_required: {
        type: String,
        enum: ["Yes", "No"],
        required: true,
    },
    uploaded_images: {
        // Store multiple image paths
        type: [String],
        default: [],
    },
    material_description: {
        type: String,
        trim: true,
    },
    approval_status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending",
    },
    approved_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    approved_at: {
        type: Date,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model("WorkAnalysis", WorkAnalysisSchema);
