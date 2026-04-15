import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./db.js";
import User from "./models/User.js";

dotenv.config();

const seedUsers = async () => {
    try {
        // Delete all existing users to reset
        await User.deleteMany({});
        console.log("✓ Cleared existing users");

        // Create test users with proper password hashing
        const users = [
            {
                name: "Admin User",
                email: "admin@example.com",
                password: "password123",
                mobile: "1234567890",
                status: "Active",
            },
            {
                name: "Mani",
                email: "mani@example.com",
                password: "password123",
                mobile: "8825620014",
                status: "Active",
            },
        ];

        for (const userData of users) {
            const newUser = new User(userData);
            await newUser.save();
            console.log(`✓ User created: ${newUser.name} (${newUser.mobile})`);
        }

        console.log("\n=== Login Credentials ===");
        console.log("User 1:");
        console.log("  Mobile: 1234567890");
        console.log("  Password: password123");
        console.log("\nUser 2:");
        console.log("  Mobile: 8825620014");
        console.log("  Password: password123");
    } catch (error) {
        console.error("Error creating user:", error.message);
    }
};

const runSeed = async () => {
    try {
        await connectDB();
        await seedUsers();
        console.log("Seed completed successfully");
        process.exit(0);
    } catch (error) {
        console.error("Seed error:", error.message);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
    }
};

runSeed();
