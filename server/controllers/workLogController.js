import WorkLog from "../models/WorkLog.js";

export const createWorkLog = async (req, res) => {
    try {
        console.log("📝 Creating Work Log...");
        console.log("Request Body:", req.body);
        
        const {
            ticket_id,
            analysis_id,
            worker_id,
            worker_name,
            from_time,
            to_time,
            duration,
            log_date,
        } = req.body;

        // Validation
        if (!ticket_id || !worker_id || !worker_name || !from_time || !to_time || !duration || !log_date) {
            return res.status(400).json({
                message: "Missing required fields: ticket_id, worker_id, worker_name, from_time, to_time, duration, log_date",
            });
        }

        // Create unique work_log_id (without uuid dependency)
        const work_log_id = `WL-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        const workLog = new WorkLog({
            work_log_id,
            ticket_id,
            analysis_id,
            worker_id,
            worker_name,
            from_time,
            to_time,
            duration,
            log_date: new Date(log_date),
        });

        const savedWorkLog = await workLog.save();
        console.log("✅ Work Log Created:", savedWorkLog);
        
        res.status(201).json({
            message: "Work Log created successfully",
            data: savedWorkLog,
        });
    } catch (error) {
        console.error("❌ Error creating work log:", error.message);
        res.status(500).json({
            message: "Error creating work log",
            error: error.message,
        });
    }
};

export const getWorkLogsByTicket = async (req, res) => {
    try {
        const { ticketId } = req.params;
        console.log("📊 Fetching Work Logs for Ticket:", ticketId);

        const workLogs = await WorkLog.find({ ticket_id: ticketId })
            .populate("ticket_id", "ticket_id title")
            .sort({ created_at: -1 });

        console.log("✅ Work Logs Retrieved:", workLogs.length);
        res.status(200).json({
            message: "Work logs retrieved successfully",
            data: workLogs,
        });
    } catch (error) {
        console.error("❌ Error fetching work logs:", error.message);
        res.status(500).json({
            message: "Error fetching work logs",
            error: error.message,
        });
    }
};

export const getWorkLogsByAnalysis = async (req, res) => {
    try {
        const { analysisId } = req.params;
        console.log("📊 Fetching Work Logs for Analysis:", analysisId);

        const workLogs = await WorkLog.find({ analysis_id: analysisId })
            .populate("ticket_id", "ticket_id title")
            .sort({ created_at: -1 });

        console.log("✅ Work Logs Retrieved:", workLogs.length);
        res.status(200).json({
            message: "Work logs retrieved successfully",
            data: workLogs,
        });
    } catch (error) {
        console.error("❌ Error fetching work logs:", error.message);
        res.status(500).json({
            message: "Error fetching work logs",
            error: error.message,
        });
    }
};

export const deleteWorkLog = async (req, res) => {
    try {
        const { workLogId } = req.params;
        console.log("🗑️ Deleting Work Log:", workLogId);

        const deletedWorkLog = await WorkLog.findByIdAndDelete(workLogId);

        if (!deletedWorkLog) {
            return res.status(404).json({
                message: "Work Log not found",
            });
        }

        console.log("✅ Work Log Deleted");
        res.status(200).json({
            message: "Work Log deleted successfully",
            data: deletedWorkLog,
        });
    } catch (error) {
        console.error("❌ Error deleting work log:", error.message);
        res.status(500).json({
            message: "Error deleting work log",
            error: error.message,
        });
    }
};
