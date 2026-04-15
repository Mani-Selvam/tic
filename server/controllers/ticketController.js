const Ticket = require("../models/Ticket");

// @desc    Create a new Ticket
// @route   POST /api/tickets
exports.createTicket = async (req, res) => {
    try {
        // 1. Extract text data
        const {
            institution_id,
            department_id,
            title,
            description,
            priority,
            status,
        } = req.body;

        // 2. Check if file was uploaded
        let imagePath = null;
        if (req.file) {
            imagePath = req.file.path; // Multer saves path here (e.g., "uploads/image-xxx.jpg")
        }

        // 3. Create Ticket Object
        // 'req.user' is set by your AuthMiddleware (see section 5)
        const ticketData = {
            institution_id,
            department_id,
            raised_by: req.user.id, // Auto Capture Login User
            title,
            description,
            image: imagePath,
            priority,
            status,
        };

        const ticket = await Ticket.create(ticketData);

        // 4. Populate details for the response (optional, but good for frontend)
        await ticket.populate("raised_by", "name email");
        await ticket.populate("assigned_to", "name email");
        await ticket.populate("institution_id", "name");
        await ticket.populate("department_id", "name");
        await ticket.populate("status_id", "name");
        await ticket.populate("priority_id", "name");
        await ticket.populate("company_id", "name");

        // 5. Convert relative image path to full URL for frontend
        const ticketResponse = ticket.toObject();
        if (ticketResponse.image && !ticketResponse.image.startsWith("http")) {
            const apiUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 5000}`;
            ticketResponse.image = `${apiUrl}/${ticketResponse.image}`;
        }

        res.status(201).json({
            success: true,
            data: ticketResponse,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message,
        });
    }
};

// @desc    Get all Tickets
// @route   GET /api/tickets
exports.getTickets = async (req, res) => {
    try {
        // If client requested only tickets assigned to current user, filter
        const requesterId =
            req.user?.user?.id || req.user?.id || req.user || null;
        const filter = {};
        if (req.query.assigned === "true" && requesterId) {
            // assigned_to is an array of ObjectIds - match tickets where assigned_to contains requesterId
            filter.assigned_to = requesterId;
        }

        const tickets = await Ticket.find(filter)
            .populate("institution_id", "name")
            .populate("department_id", "name")
            .populate("raised_by", "name email")
            .populate("assigned_to", "name email")
            .populate("status_id", "name") // ✅ IMPORTANT: Populate status_id to show status name
            .populate("priority_id", "name")
            .populate("company_id", "name")
            .select("+closed_at +createdAt +updatedAt") // ✅ Explicitly include date fields
            .sort({ createdAt: -1 });

        // Convert relative image paths to full URLs for frontend
        const apiUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 5000}`;
        const formattedTickets = tickets.map(ticket => {
            const ticketObj = ticket.toObject();
            // Convert relative image path to full URL if needed
            if (ticketObj.image && !ticketObj.image.startsWith("http")) {
                ticketObj.image = `${apiUrl}/${ticketObj.image}`;
            }
            return {
                ...ticketObj,
                createdAt: ticket.createdAt, // ISO string
                closed_at: ticket.closed_at, // ISO string if exists, null otherwise
            };
        });

        res.status(200).json({
            success: true,
            count: formattedTickets.length,
            data: formattedTickets,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update Ticket (e.g., change status to Closed)
// @route   PUT /api/tickets/:id
exports.updateTicket = async (req, res) => {
    try {
        let ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res
                .status(404)
                .json({ success: false, message: "Ticket not found" });
        }

        // Manually update fields from request body
        if (req.body.company_id !== undefined) ticket.company_id = req.body.company_id;
        if (req.body.department_id !== undefined) ticket.department_id = req.body.department_id;
        if (req.body.title !== undefined) ticket.title = req.body.title;
        if (req.body.description !== undefined) ticket.description = req.body.description;
        if (req.body.priority_id !== undefined) ticket.priority_id = req.body.priority_id;
        if (req.body.status_id !== undefined) ticket.status_id = req.body.status_id;
        if (req.body.status !== undefined) ticket.status = req.body.status;
        if (req.body.location !== undefined) ticket.location = req.body.location;
        
        // Properly handle closed_at as a Date object
        if (req.body.closed_at !== undefined) {
            ticket.closed_at = req.body.closed_at ? new Date(req.body.closed_at) : null;
        }

        // Save the document (this will trigger pre-save hooks if any)
        await ticket.save();

        // Populate all relationships including status_id to return full details
        await ticket.populate("institution_id", "name");
        await ticket.populate("department_id", "name");
        await ticket.populate("raised_by", "name email");
        await ticket.populate("assigned_to", "name email");
        await ticket.populate("status_id", "name"); // ✅ IMPORTANT: Populate status_id to show status name
        await ticket.populate("priority_id", "name");
        await ticket.populate("company_id", "name");

        res.status(200).json({ success: true, data: ticket });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
