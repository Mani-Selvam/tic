import mongoose from "mongoose";

const PrioritySchema = new mongoose.Schema({
    name: { type: String, required: true },
    color: { type: String, required: true, default: "#000000" },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Priority", PrioritySchema);
