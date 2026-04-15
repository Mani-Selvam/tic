import mongoose from "mongoose";

const DesignationSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Designation", DesignationSchema);
