import express from "express";
import Designation from "../models/Designation.js";

const router = express.Router();

// GET ALL
router.get("/", async (req, res) => {
    try {
        const designations = await Designation.find().sort({ createdAt: -1 });
        res.json(designations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// CREATE
router.post("/", async (req, res) => {
    try {
        const { name, status } = req.body;
        const newDesignation = new Designation({ name, status });
        const savedDesignation = await newDesignation.save();
        res.status(201).json(savedDesignation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// UPDATE
router.put("/:id", async (req, res) => {
    try {
        const updatedDesignation = await Designation.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true },
        );
        res.json(updatedDesignation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE
router.delete("/:id", async (req, res) => {
    try {
        await Designation.findByIdAndDelete(req.params.id);
        res.json({ message: "Designation deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
