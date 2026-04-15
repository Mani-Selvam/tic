import dotenv from "dotenv";
import connectDB from "./db.js";
import User from "./models/User.js";

dotenv.config();

const testLogin = async () => {
    try {
        await connectDB();

        // Find the user
        const user = await User.findOne({ email: "admin@example.com" });

        if (!user) {
            console.log("❌ User not found in database");
            console.log("\nLet's create a new user...");

            const newUser = new User({
                name: "Admin User",
                email: "admin@example.com",
                password: "password123",
                mobile: "1234567890",
                status: "Active",
            });

            await newUser.save();
            console.log("✅ User created successfully!");
            console.log("Email: admin@example.com");
            console.log("Password: password123");
        } else {
            console.log("✅ User found!");
            console.log("Name:", user.name);
            console.log("Email:", user.email);
            console.log("Status:", user.status);

            // Test password comparison
            const isMatch = await user.comparePassword("password123");
            if (isMatch) {
                console.log("✅ Password matches!");
            } else {
                console.log("❌ Password does NOT match!");
                console.log("\nRecreating user with correct password...");

                await User.deleteOne({ email: "admin@example.com" });

                const newUser = new User({
                    name: "Admin User",
                    email: "admin@example.com",
                    password: "password123",
                    mobile: "1234567890",
                    status: "Active",
                });

                await newUser.save();
                console.log("✅ User recreated with password: password123");
            }
        }

        console.log("\n✅ Ready to test login!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error.message);
        process.exit(1);
    }
};

testLogin();
