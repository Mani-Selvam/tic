import express from "express";
// Add .js extension!
import Priority from "../models/Priority.js";

const router = express.Router();

// GET ALL
router.get("/", async (req, res) => {
    try {
        const priorities = await Priority.find().sort({ createdAt: -1 });
        res.json(priorities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// CREATE
router.post("/", async (req, res) => {
    try {
        const { name, color, status } = req.body;
        const newPriority = new Priority({ name, color, status });
        const savedPriority = await newPriority.save();
        res.status(201).json(savedPriority);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// UPDATE
router.put("/:id", async (req, res) => {
    try {
        const updatedPriority = await Priority.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true },
        );
        res.json(updatedPriority);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE
router.delete("/:id", async (req, res) => {
    try {
        await Priority.findByIdAndDelete(req.params.id);
        res.json({ message: "Priority deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
