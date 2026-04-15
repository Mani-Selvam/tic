import express from "express";
// IMPORTANT: Add .js extension here!
import Company from "../models/Company.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// 1. GET ALL COMPANIES
router.get("/", async (req, res) => {
    try {
        const companies = await Company.find().sort({ createdAt: -1 });
        res.json(companies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 2. CREATE COMPANY
router.post("/", upload.single("logo"), async (req, res) => {
    try {
        const { code, name, address, phone, mobile, email, website } = req.body;

        let logoUrl = "";
        if (req.file) {
            logoUrl = `${process.env.API_URL}/uploads/${req.file.filename}`;
        }

        const newCompany = new Company({
            code,
            name,
            address,
            phone,
            mobile,
            email,
            website,
            logo: logoUrl,
        });

        const savedCompany = await newCompany.save();
        res.status(201).json(savedCompany);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// 3. UPDATE COMPANY
router.put("/:id", upload.single("logo"), async (req, res) => {
    try {
        const { code, name, address, phone, mobile, email, website } = req.body;

        let logoUrl = undefined;
        if (req.file) {
            logoUrl = `${process.env.API_URL}/uploads/${req.file.filename}`;
        }

        const updateData = {
            code,
            name,
            address,
            phone,
            mobile,
            email,
            website,
        };
        if (logoUrl) updateData.logo = logoUrl;

        const updatedCompany = await Company.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true },
        );
        res.json(updatedCompany);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// 4. DELETE COMPANY
router.delete("/:id", async (req, res) => {
    try {
        await Company.findByIdAndDelete(req.params.id);
        res.json({ message: "Company deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
