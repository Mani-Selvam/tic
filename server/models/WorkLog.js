import mongoose from "mongoose";

const WorkLogSchema = new mongoose.Schema({
    work_log_id: {
        type: String,
        unique: true,
        index: true,
    },
    ticket_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ticket",
        required: true,
    },
    analysis_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "WorkAnalysis",
    },
    worker_id: {
        type: String,
        required: true,
    },
    worker_name: {
        type: String,
        required: true,
        trim: true,
    },
    from_time: {
        type: String,
        required: true,
    },
    to_time: {
        type: String,
        required: true,
    },
    duration: {
        type: String,
        required: true,
    },
    log_date: {
        type: Date,
        required: true,
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

export default mongoose.model("WorkLog", WorkLogSchema);
