import React, { useState, useEffect } from "react";
import { createTicket } from "@/Components/Api/TicketApi/ticketAPI";
import { updateTicket } from "@/Components/Api/TicketApi/ticketAPI";
import { useAuth } from "../Login/AuthContext";
import API_ENDPOINTS from "../../config/apiConfig";
import "./ticketForm.css";

const CreateTicket = ({
    onTicketCreated,
    isEdit = false,
    initialData = null,
    onTicketUpdated,
}) => {
    const { user } = useAuth(); // Get current logged-in user
    const [formData, setFormData] = useState({
        company_id: "",
        department_id: "",
        title: "",
        description: "",
        priority_id: "",
        status_id: "raised", // Default status is "Raised"
        location: "",
        image: null,
    });

    // If editing, populate initial data
    useEffect(() => {
        if (isEdit && initialData) {
            setFormData((prev) => ({
                ...prev,
                company_id:
                    initialData.company_id?._id || initialData.company_id || "",
                department_id:
                    initialData.department_id?._id ||
                    initialData.department_id ||
                    "",
                title: initialData.title || "",
                description: initialData.description || "",
                priority_id:
                    initialData.priority_id?._id ||
                    initialData.priority_id ||
                    "",
                status_id:
                    initialData.status_id?._id || initialData.status_id || "",
                location: initialData.location || "",
                image: null, // image editing not supported in this modal
            }));
        }
    }, [isEdit, initialData]);

    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [companies, setCompanies] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [priorities, setPriorities] = useState([]);
    const [ticketStatuses, setTicketStatuses] = useState([]);
    const [companiesLoading, setCompaniesLoading] = useState(true);
    const [departmentsLoading, setDepartmentsLoading] = useState(true);
    const [prioritiesLoading, setPrioritiesLoading] = useState(true);
    const [statusesLoading, setStatusesLoading] = useState(true);

    // Fetch companies on mount
    useEffect(() => {
        fetchCompanies();
        fetchDepartments();
        fetchPriorities();
        fetchTicketStatuses();
    }, []);

    const fetchCompanies = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.COMPANIES);
            const data = await response.json();
            setCompanies(data);
        } catch (error) {
            console.error("Failed to fetch companies:", error);
        } finally {
            setCompaniesLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.DEPARTMENTS);
            const data = await response.json();
            setDepartments(data);
        } catch (error) {
            console.error("Failed to fetch departments:", error);
        } finally {
            setDepartmentsLoading(false);
        }
    };

    const fetchPriorities = async () => {
        try {
            const res = await fetch(API_ENDPOINTS.PRIORITIES);
            const data = await res.json();
            setPriorities(data || []);
        } catch (err) {
            console.error("Failed to fetch priorities:", err);
        } finally {
            setPrioritiesLoading(false);
        }
    };

    const fetchTicketStatuses = async () => {
        try {
            const res = await fetch(API_ENDPOINTS.TICKET_STATUSES);
            const data = await res.json();
            setTicketStatuses(data || []);
        } catch (err) {
            console.error("Failed to fetch ticket statuses:", err);
        } finally {
            setStatusesLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData((prev) => ({ ...prev, image: file }));
            setPreview(URL.createObjectURL(file)); // Show preview
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // Validate that user is logged in
            if (!user || (!user._id && !user.id)) {
                setError("You must be logged in to create a ticket");
                setLoading(false);
                return;
            }

            // Get user ID (could be id or _id)
            const userId = user._id || user.id;

            // Create FormData object for Multipart upload
            const dataToSend = new FormData();
            dataToSend.append("company_id", formData.company_id);
            dataToSend.append("department_id", formData.department_id);
            dataToSend.append("title", formData.title);
            dataToSend.append("description", formData.description);
            dataToSend.append("priority_id", formData.priority_id);
            dataToSend.append("location", formData.location);
            // Map display status (e.g., "raised") to actual status ObjectId if available
            let statusToSend = formData.status_id;
            try {
                if (
                    (!statusToSend || statusToSend === "raised") &&
                    Array.isArray(ticketStatuses)
                ) {
                    const found = ticketStatuses.find(
                        (s) => String(s.name).toLowerCase() === "raised",
                    );
                    if (found && (found._id || found.id)) {
                        statusToSend = found._id || found.id;
                    }
                }
            } catch (err) {
                console.warn("Error mapping status to id:", err);
            }
            dataToSend.append("status_id", statusToSend);
            dataToSend.append("raised_by", userId); // Add current user ID

            // Log FormData for debugging
            console.log("FormData being sent:", {
                company_id: formData.company_id,
                department_id: formData.department_id,
                title: formData.title,
                description: formData.description,
                priority_id: formData.priority_id,
                location: formData.location,
                status_id: formData.status_id,
                raised_by: userId,
            });

            if (isEdit) {
                // Check if user is trying to close the ticket
                const selectedStatus = ticketStatuses.find(
                    (s) => String(s._id || s.id) === String(formData.status_id)
                );
                const isClosingTicket = selectedStatus && String(selectedStatus.name).toLowerCase() === "closed";
                
                if (isClosingTicket) {
                    // Get current user from localStorage
                    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
                    const currentUserId = currentUser.id || currentUser._id;
                    const raisedByUserId = initialData.raised_by?._id || initialData.raised_by;
                    
                    // Only the person who raised the ticket can close it
                    if (String(currentUserId) !== String(raisedByUserId)) {
                        setError("Only the person who raised this ticket can close it");
                        setLoading(false);
                        return;
                    }
                }
                
                // For edit, call update API with JSON (image upload not supported in edit modal)
                const updatePayload = {
                    company_id: formData.company_id || undefined,
                    department_id: formData.department_id || undefined,
                    title: formData.title || undefined,
                    description: formData.description || undefined,
                    priority_id: formData.priority_id || undefined,
                    status_id: formData.status_id || undefined,
                    location: formData.location || undefined,
                };
                
                // If closing ticket, add closed_at timestamp
                if (isClosingTicket) {
                    updatePayload.closed_at = new Date().toISOString();
                }

                await updateTicket(initialData._id, updatePayload);
                
                // Dynamic success message based on status
                let successMsg = "Ticket updated successfully!";
                if (selectedStatus) {
                    const statusName = String(selectedStatus.name).toLowerCase();
                    
                    // Custom messages for each status
                    const statusMessages = {
                        "closed": "🔒 Ticket closed successfully!",
                        "material approved": "✅ Material approved successfully!",
                        "material request": "📋 Material request updated successfully!",
                        "working in progress": "⏳ Ticket marked as working in progress!",
                        "work completed": "✔️ Work completed successfully!",
                        "raised": "🚀 Ticket raised successfully!",
                        "approved": "✅ Ticket approved successfully!",
                    };
                    
                    successMsg = statusMessages[statusName] || `✓ Ticket status changed to ${selectedStatus.name} successfully!`;
                }
                
                setSuccessMessage(successMsg);
                if (onTicketUpdated) onTicketUpdated(selectedStatus?.name);
                // Auto dismiss
                setTimeout(() => setSuccessMessage(""), 3000);
            } else {
                if (formData.image) {
                    dataToSend.append("image", formData.image);
                }

                await createTicket(dataToSend);
                
                // Get status name BEFORE resetting the form
                let statusNameForCallback = "Raised"; // Default
                
                try {
                    // Find the selected status from ticketStatuses array
                    if (formData.status_id && ticketStatuses && ticketStatuses.length > 0) {
                        const found = ticketStatuses.find(
                            s => String(s._id || s.id) === String(formData.status_id)
                        );
                        if (found && found.name) {
                            statusNameForCallback = found.name;
                        }
                    }
                } catch (err) {
                    console.warn("Error finding status name:", err);
                }
                
                console.log("✅ Ticket created with status:", statusNameForCallback);
                
                setSuccessMessage("Ticket created successfully!");
                // Reset form
                setFormData({
                    company_id: "",
                    department_id: "",
                    title: "",
                    description: "",
                    priority_id: "",
                    status: "",
                    location: "",
                    image: null,
                });
                setPreview(null);

                // Pass status info to parent component for dynamic success message
                if (onTicketCreated) {
                    onTicketCreated(statusNameForCallback);
                }
                // Auto dismiss success message
                setTimeout(() => setSuccessMessage(""), 3000);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ticket-form-container">
            <div className="ticket-card">
                {successMessage && (
                    <div className="success-card">{successMessage}</div>
                )}
                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Raised By</label>
                            <input
                                type="text"
                                value={user?.name || "Not logged in"}
                                disabled
                                placeholder="Current user"
                                style={{
                                    backgroundColor: "#f3f4f6",
                                    cursor: "not-allowed",
                                }}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Company</label>
                            <select
                                name="company_id"
                                value={formData.company_id}
                                onChange={handleChange}
                                disabled={companiesLoading}>
                                <option value="">
                                    {companiesLoading
                                        ? "Loading..."
                                        : "Select Company (Optional)"}
                                </option>
                                {companies.map((company) => (
                                    <option
                                        key={company._id}
                                        value={company._id}>
                                        {company.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Department</label>
                            <select
                                name="department_id"
                                value={formData.department_id}
                                onChange={handleChange}
                                disabled={departmentsLoading}
                                required>
                                <option value="">
                                    {departmentsLoading
                                        ? "Loading..."
                                        : "Select Department"}
                                </option>
                                {departments.map((dept) => (
                                    <option key={dept._id} value={dept._id}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Location</label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="Enter location (e.g., Building A, Room 101)"
                        />
                    </div>
                    <div className="form-group">
                        <label>Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Brief summary of issue"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe the issue in detail..."
                            rows="4"
                            required></textarea>
                    </div>

                  

                    <div className="form-row">
                        <div className="form-group">
                            <label>Priority</label>
                            <select
                                name="priority_id"
                                value={formData.priority_id}
                                onChange={handleChange}
                                disabled={prioritiesLoading}
                                required>
                                {prioritiesLoading ? (
                                    <option>Loading...</option>
                                ) : (
                                    <>
                                        <option value="">
                                            -- Select Priority --
                                        </option>
                                        {priorities.map((p) => (
                                            <option key={p._id} value={p._id}>
                                                {p.name}
                                            </option>
                                        ))}
                                    </>
                                )}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Status</label>
                            {isEdit ? (
                                <select
                                    name="status_id"
                                    value={formData.status_id}
                                    onChange={handleChange}
                                    disabled={statusesLoading}
                                >
                                    <option value="">
                                        {statusesLoading
                                            ? "Loading..."
                                            : "-- Select Status --"}
                                    </option>
                                    {ticketStatuses
                                        .filter((s) => {
                                            // If status tied to a company, only show matching company statuses
                                            if (!s.company_id) return true;
                                            const compId =
                                                s.company_id._id || s.company_id;
                                            return (
                                                String(compId) ===
                                                String(formData.company_id)
                                            );
                                        })
                                        .map((s) => {
                                            // Check if this is the "Closed" status
                                            const isClosedStatus = String(s.name).toLowerCase() === "closed";
                                            
                                            // Check if current user can close (must be ticket raiser)
                                            let canSelectClosed = true;
                                            if (isClosedStatus && initialData) {
                                                const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
                                                const currentUserId = currentUser.id || currentUser._id;
                                                const raisedByUserId = initialData.raised_by?._id || initialData.raised_by;
                                                canSelectClosed = String(currentUserId) === String(raisedByUserId);
                                            }
                                            
                                            return (
                                                <option 
                                                    key={s._id} 
                                                    value={s._id}
                                                    disabled={isClosedStatus && !canSelectClosed}
                                                    title={isClosedStatus && !canSelectClosed ? "Only the person who raised this ticket can close it" : ""}
                                                >
                                                    {s.name}
                                                    {isClosedStatus && !canSelectClosed ? " (Not available)" : ""}
                                                </option>
                                            );
                                        })}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    value="Raised"
                                    disabled
                                    className="status-field-raised"
                                    style={{
                                        backgroundColor: "#fff3cd",
                                        borderColor: "#ffc107",
                                        cursor: "not-allowed",
                                        fontWeight: "600",
                                        color: "#856404",
                                    }}
                                />
                            )}
                         
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Attachment (Image)</label>
                        <input
                            type="file"
                            name="image"
                            accept="image/jpeg, image/png"
                            onChange={handleImageChange}
                        />
                        {preview && (
                            <div className="image-preview">
                                <img src={preview} alt="Preview" />
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={loading}>
                        {loading ? "Saving..." : "Save"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateTicket;
