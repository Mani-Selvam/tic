import dotenv from "dotenv";
import mongoose from "mongoose";
import WorkAnalysisModel from "./models/WorkAnalysis.js";

dotenv.config();

async function checkData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected");

        const analyses = await WorkAnalysisModel.find({}).limit(10);
        console.log(`\n📊 Total WorkAnalysis records: ${analyses.length}\n`);

        if (analyses.length > 0) {
            analyses.forEach((analysis, index) => {
                console.log(`Record ${index + 1}:`);
                console.log(`  - _id: ${analysis._id}`);
                console.log(`  - ticket_id: ${analysis.ticket_id}`);
                console.log(`  - material_required: "${analysis.material_required}" (type: ${typeof analysis.material_required})`);
                console.log(`  - created_at: ${analysis.created_at}`);
                console.log("");
            });
        }

        // Count by material_required value
        const countYes = await WorkAnalysisModel.countDocuments({ material_required: "Yes" });
        const countNo = await WorkAnalysisModel.countDocuments({ material_required: "No" });
        const countFalse = await WorkAnalysisModel.countDocuments({ material_required: false });
        const countTrue = await WorkAnalysisModel.countDocuments({ material_required: true });

        console.log("\n📈 Count by material_required value:");
        console.log(`  - "Yes": ${countYes}`);
        console.log(`  - "No": ${countNo}`);
        console.log(`  - false: ${countFalse}`);
        console.log(`  - true: ${countTrue}`);

        mongoose.connection.close();
    } catch (error) {
        console.error("❌ Error:", error.message);
        process.exit(1);
    }
}

checkData();
