import mongoose from "mongoose";

const CompanySchema = new mongoose.Schema({
    code: { type: String, required: true },
    name: { type: String, required: true },
    address: { type: String },
    phone: { type: String },
    mobile: { type: String },
    email: { type: String },
    website: { type: String },
    logo: { type: String },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Company", CompanySchema);
