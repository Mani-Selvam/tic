import express from "express";
import Department from "../models/Department.js";

const router = express.Router();

// GET ALL DEPARTMENTS
router.get("/", async (req, res) => {
    try {
        const departments = await Department.find().sort({ createdAt: -1 });
        res.json(departments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// CREATE DEPARTMENT
router.post("/", async (req, res) => {
    try {
        const { name, status } = req.body;
        const newDepartment = new Department({ name, status });
        const savedDepartment = await newDepartment.save();
        res.status(201).json(savedDepartment);
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({
                message: "Department name already exists.",
            });
        } else {
            res.status(400).json({ message: "Failed to create department." });
        }
    }
});

// UPDATE DEPARTMENT
router.put("/:id", async (req, res) => {
    try {
        const updatedDepartment = await Department.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true },
        );
        res.json(updatedDepartment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE DEPARTMENT
router.delete("/:id", async (req, res) => {
    try {
        await Department.findByIdAndDelete(req.params.id);
        res.json({ message: "Department deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
