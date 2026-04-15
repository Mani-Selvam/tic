import mongoose from "mongoose";
import TicketStatus from "./models/TicketStatus.js";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "");
        console.log("MongoDB Connected");

        // Initialize Material Statuses if they don't exist
        await initializeMaterialStatuses();
    } catch (error) {
        console.error("MongoDB Connection Error:", error.message);
        process.exit(1);
    }
};

// Initialize Material Request and Material Approved statuses
const initializeMaterialStatuses = async () => {
    try {
        const statuses = [
            { name: "Material Request", sortOrder: 99 },
            { name: "Material Approved", sortOrder: 100 },
        ];

        for (const status of statuses) {
            const existing = await TicketStatus.findOne({ name: status.name });

            if (!existing) {
                await TicketStatus.create({
                    name: status.name,
                    sortOrder: status.sortOrder,
                    status: "Active",
                });
                console.log(`✅ Created TicketStatus: ${status.name}`);
            } else {
                console.log(`✓ TicketStatus already exists: ${status.name}`);
            }
        }
    } catch (error) {
        console.error(
            "❌ Error initializing Material Statuses:",
            error.message,
        );
        // Don't block connection if this fails
    }
};

export default connectDB;
