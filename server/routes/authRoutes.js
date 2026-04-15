import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post("/login", async (req, res) => {
    const { mobile, password } = req.body;

    console.log("Login attempt with mobile:", mobile);
    console.log("Password received length:", password ? password.length : 0);
    console.log("Password received:", password ? `"${password}"` : "null");

    try {
        // Validate input
        if (!mobile || !password) {
            console.log("Missing mobile or password");
            return res
                .status(400)
                .json({ message: "Mobile and password are required" });
        }

        // 1. Check if user exists
        let user = await User.findOne({ mobile });
        if (!user) {
            console.log("User not found with mobile:", mobile);
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        console.log("User found:", user.name);
        console.log("Password in DB:", user.password ? "exists (hashed)" : "missing");
        console.log("Hashed password length:", user.password ? user.password.length : 0);

        // 2. Check if password is correct
        console.log("Attempting bcrypt comparison...");
        const isMatch = await user.comparePassword(password);
        console.log("Password comparison result:", isMatch);
        if (!isMatch) {
            console.log("Password mismatch for user:", mobile);
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        console.log("Password matched, generating token");

        // 3. If credentials are correct, create and return JWT
        const payload = {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: "7d" }, // Token expires in 7 days
            (err, token) => {
                if (err) {
                    console.error("JWT error:", err.message);
                    return res
                        .status(500)
                        .json({ message: "Token generation failed" });
                }
                console.log("Token generated successfully");
                res.json({
                    token,
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        mobile: user.mobile,
                        companyId: user.companyId,
                        designationId: user.designationId,
                        status: user.status,
                    },
                });
            },
        );
    } catch (err) {
        console.error("Login error:", err.message);
        console.error("Error details:", err);
        res.status(500).json({ message: "Server Error", error: err.message });
    }
});

// @route   POST api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Public
router.post("/logout", (req, res) => {
    try {
        res.json({ message: "Logged out successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// @route   POST api/auth/login/master
// @desc    Authenticate user using User Master API (with populated company & designation)
// @access  Public
router.post("/login/master", async (req, res) => {
    const { mobile, password } = req.body;

    console.log("Login attempt (Master API) with mobile:", mobile);

    try {
        // Validate input
        if (!mobile || !password) {
            console.log("Missing mobile or password");
            return res
                .status(400)
                .json({ message: "Mobile and password are required" });
        }

        // 1. Get user from User Master with populated data
        let user = await User.findOne({ mobile })
            .populate("companyId", "name")
            .populate("designationId", "name");

        if (!user) {
            console.log("User not found in Master API with mobile:", mobile);
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        console.log("User found in Master API:", user.name);

        // 2. Check if password is correct
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log("Password mismatch for user:", mobile);
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        console.log("Password matched, generating token");

        // 3. If credentials are correct, create and return JWT
        const payload = {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: "7d" },
            (err, token) => {
                if (err) {
                    console.error("JWT error:", err.message);
                    return res
                        .status(500)
                        .json({ message: "Token generation failed" });
                }
                console.log("Token generated successfully (Master API)");
                res.json({
                    token,
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        mobile: user.mobile,
                        companyId: user.companyId,
                        designationId: user.designationId,
                        status: user.status,
                        company: user.companyId?.name || null,
                        designation: user.designationId?.name || null,
                    },
                });
            },
        );
    } catch (err) {
        console.error("Login error (Master API):", err.message);
        console.error("Error details:", err);
        res.status(500).json({ message: "Server Error", error: err.message });
    }
});

export default router;
