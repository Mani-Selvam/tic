import mongoose from "mongoose";
import WorkAnalysis from "./models/WorkAnalysis.js";

const MONGO_URI = process.env.MONGO_URI;

async function testUpdate() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // Find all work analyses and group by ticket_id
        const analyses = await WorkAnalysis.find().select("ticket_id analysis_id created_at updated_at");
        console.log("\n📊 Total Work Analysis Records:", analyses.length);

        // Group by ticket_id
        const grouped = {};
        analyses.forEach((a) => {
            const ticketId = String(a.ticket_id);
            if (!grouped[ticketId]) {
                grouped[ticketId] = [];
            }
            grouped[ticketId].push({
                _id: a._id,
                analysis_id: a.analysis_id,
                created_at: a.created_at,
                updated_at: a.updated_at,
            });
        });

        console.log("\n🔍 Records Grouped by Ticket ID:");
        Object.entries(grouped).forEach(([ticketId, records]) => {
            if (records.length > 1) {
                console.log(`\n⚠️ Ticket ${ticketId} has ${records.length} DUPLICATE records:`);
                records.forEach((r, i) => {
                    console.log(`   ${i + 1}. ${r.analysis_id} - Created: ${r.created_at} - Updated: ${r.updated_at}`);
                });
            } else {
                console.log(`✅ Ticket ${ticketId} has 1 record: ${records[0].analysis_id}`);
            }
        });

        await mongoose.connection.close();
        console.log("\n✅ Done!");
    } catch (err) {
        console.error("❌ Error:", err.message);
    }
}

testUpdate();
