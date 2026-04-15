import express from "express";
import User from "../models/User.js";
import Company from "../models/Company.js";
import Designation from "../models/Designation.js";
import bcrypt from "bcryptjs";
const router = express.Router();

// GET ALL USERS WITH POPULATED COMPANY AND DESIGNATION
router.get("/", async (req, res) => {
    try {
        const users = await User.find()
            .populate("companyId", "name")
            .populate("designationId", "name")
            .sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET DROPDOWN DATA
router.get("/dropdowns", async (req, res) => {
    try {
        const companies = await Company.find().select("name");
        const designations = await Designation.find().select("name");
        res.json({ companies, designations });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET USER BY ID
router.get("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate("companyId", "name")
            .populate("designationId", "name");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// CREATE USER
router.post("/", async (req, res) => {
    try {
        console.log("REQUEST BODY:", req.body); // 👈 ADD

        const {
            name,
            companyId,
            designationId,
            mobile,
            email,
            password,
            status,
        } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res
                .status(400)
                .json({ message: "User with this email already exists" });
        }

        const newUser = new User({
            name,
            companyId,
            designationId,
            mobile,
            email,
            password,
            status,
        });

        const savedUser = await newUser.save();

        const userResponse = savedUser.toObject();
        delete userResponse.password;

        res.status(201).json(userResponse);
    } catch (error) {
        console.log("ERROR:", error); // 👈 ADD
        res.status(400).json({ message: error.message });
    }
});

// UPDATE USER
router.put("/:id", async (req, res) => {
    try {
        const { password, ...updateData } = req.body;

        // Only update password if it's provided
        if (password) {
            const user = await User.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            // Hash the new password
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true },
        )
            .populate("companyId", "name")
            .populate("designationId", "name");

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Don't return the password
        const userResponse = updatedUser.toObject();
        delete userResponse.password;

        res.json(userResponse);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE USER
router.delete("/:id", async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ message: "User deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
