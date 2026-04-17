import React, { useState, useEffect } from "react";
import { createWorkAnalysis, getWorkAnalysis } from "@/Components/Api/TicketApi/workAnalysisAPI";
import { getTickets, updateTicket } from "@/Components/Api/TicketApi/ticketAPI";
import { getTicketStatuses } from "@/Components/Api/MasterApi/ticketStatusApi";
import { useAuth } from "../Login/AuthContext";
import "./workAnalysis.css";

const WorkAnalysisForm = ({
    ticketId,
    ticketTitle,
    onSuccess,
    workerId,
    onAnalysisCreated,
    initialData,
    draftData,
    onFormChange,
}) => {
    // Get logged-in user from AuthContext
    const { user } = useAuth();
    
    const initialFormData = {
        ticket_id: ticketId || "",
        worker_id: user?.id || workerId || "",
        worker_name: user?.name || "",
        material_required: "No",
        material_description: "",
        analysis_status: "Approved",
    };

    // If draft data provided (from localStorage), use it first (highest priority)
    if (draftData) {
        initialFormData.ticket_id = draftData.ticket_id || initialFormData.ticket_id;
        initialFormData.worker_id = draftData.worker_id || initialFormData.worker_id;
        initialFormData.worker_name = draftData.worker_name || initialFormData.worker_name;
        initialFormData.material_required = draftData.material_required || initialFormData.material_required;
        initialFormData.material_description = draftData.material_description || initialFormData.material_description;
        initialFormData.analysis_status = draftData.analysis_status || initialFormData.analysis_status;
    }
    // Else if parent provided previous submission data, use it to prefill
    else if (initialData) {
        initialFormData.ticket_id = initialData.ticket_id?._id || initialData.ticket_id || initialFormData.ticket_id;
        initialFormData.worker_id = initialData.worker_id || initialFormData.worker_id;
        initialFormData.worker_name = initialData.worker_name || initialFormData.worker_name || "";
        initialFormData.material_required = initialData.material_required || initialFormData.material_required;
        initialFormData.material_description = initialData.material_description || initialFormData.material_description;
        initialFormData.analysis_status = initialData.analysis_status || initialFormData.analysis_status;
    }

    const [formData, setFormData] = useState(initialFormData);
    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [ticketsLoading, setTicketsLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [displayAnalysis, setDisplayAnalysis] = useState(null);
    const [ticketStatuses, setTicketStatuses] = useState([]);

    // Helper function to safely convert any value to string
    const safeString = (value, fallback = "N/A") => {
        if (value === null || value === undefined) return fallback;
        if (typeof value === "string") return value;
        if (typeof value === "number") return value.toString();
        if (typeof value === "object") {
            if (value._id) return value._id.toString();
            if (value.id) return value.id.toString();
            if (value.ticket_id)
                return typeof value.ticket_id === "object"
                    ? value.ticket_id._id || fallback
                    : value.ticket_id.toString();
            if (value.title) return value.title.toString();
            try {
                return JSON.stringify(value);
            } catch {
                return fallback;
            }
        }
        return String(value);
    };

    // Function to reset form to initial state
    const resetForm = () => {
        setFormData(initialFormData);
        setSelectedTicket(null);
        setImages([]);
        setSuccessMsg("");
    };

    // Fetch tickets and ticket statuses on component mount
    useEffect(() => {
        const fetchTickets = async () => {
            setTicketsLoading(true);
            try {
                const data = await getTickets();
                setTickets(data || []);
            } catch (error) {
                console.error("Error fetching tickets:", error.message);
            } finally {
                setTicketsLoading(false);
            }
        };
        
        const fetchStatuses = async () => {
            try {
                const statuses = await getTicketStatuses();
                console.log("📊 Ticket Statuses loaded:", statuses);
                setTicketStatuses(statuses || []);
            } catch (error) {
                console.error("Error fetching ticket statuses:", error.message);
            }
        };
        
        fetchTickets();
        fetchStatuses();
    }, []);

    // If component was opened for a specific ticket, ensure selectedTicket and formData reflect it
    useEffect(() => {
        if (!ticketId) return;
        // If tickets already fetched, try to find matching ticket
        const existing = tickets.find(
            (t) => safeString(t?._id) === safeString(ticketId),
        );
        if (existing) {
            setSelectedTicket(existing);
            setFormData((fd) => ({
                ...fd,
                ticket_id: safeString(existing._id),
            }));
        } else {
            // Fallback: set minimal selectedTicket from props
            setSelectedTicket({
                _id: ticketId,
                ticket_id: ticketTitle || ticketId,
                title: ticketTitle || "",
            });
            setFormData((fd) => ({ ...fd, ticket_id: ticketId }));
        }
    }, [ticketId, ticketTitle, tickets]);

    // If initialData changes (prefill for edit/return), update form state
    useEffect(() => {
        if (!initialData) return;
        setFormData((fd) => ({
            ...fd,
            ticket_id: initialData.ticket_id?._id || initialData.ticket_id || fd.ticket_id,
            worker_id: initialData.worker_id || fd.worker_id,
            worker_name: initialData.worker_name || fd.worker_name,
            material_required: initialData.material_required || fd.material_required,
            material_description: initialData.material_description || fd.material_description,
            analysis_status: initialData.analysis_status || fd.analysis_status,
        }));

        // If ticket info included, set selectedTicket for display
        if (initialData.ticket_id) {
            const t = tickets.find((t) => (t._id === (initialData.ticket_id._id || initialData.ticket_id)));
            if (t) setSelectedTicket(t);
            else setSelectedTicket({ _id: initialData.ticket_id._id || initialData.ticket_id, ticket_id: initialData.ticket_id.ticket_id || "", title: initialData.ticket_id.title || "" });
        }
    }, [initialData]);

    // Auto-save form changes to parent (for localStorage persistence)
    useEffect(() => {
        if (onFormChange) {
            onFormChange(formData);
        }
    }, [formData, onFormChange]);

    const handleTicketChange = (e) => {
        const ticketIdValue = e.target.value;
        const ticket = tickets.find((t) => t._id === ticketIdValue);
        setSelectedTicket(ticket || null);
        setFormData({
            ...formData,
            ticket_id: ticketIdValue,
        });
    };

    const handleToggle = (value) => {
        console.log("🔘 Material toggle clicked:", value);
        // When material is NOT required (No), clear the material description
        // Keep images regardless - they are work documentation
        const updatedFormData = {
            ...formData,
            material_required: value,
            analysis_status: value === "Yes" ? "Pending" : "Approved",
        };
        
        if (value === "No") {
            updatedFormData.material_description = "";
        }
        
        setFormData(updatedFormData);
        console.log("📝 Form data updated - material_required:", value);
        console.log("📝 Current images array:", images);
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files || []);
        setImages((prev) => [...prev, ...selectedFiles]);
    };

    const removeImage = (index) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMsg("");

        try {
            const dataToSend = new FormData();
            dataToSend.append("ticket_id", formData.ticket_id);
            dataToSend.append("worker_id", formData.worker_id || workerId);
            dataToSend.append("material_required", formData.material_required);
            dataToSend.append(
                "material_description",
                formData.material_description,
            );
            dataToSend.append("analysis_status", formData.analysis_status);

            console.log("🔵 Work Analysis Form Submission");
            console.log("   Ticket ID:", formData.ticket_id);
            console.log("   Worker ID:", formData.worker_id || workerId);
            console.log("   Material Required:", formData.material_required);
            console.log("   Material Description:", formData.material_description);
            console.log("   Images Count:", images.length);
            console.log("   Images Array:", images);

            // Append images with detailed logging
            if (images && images.length > 0) {
                images.forEach((img, index) => {
                    console.log(`   Appending image ${index}:`, img.name, img.size, img.type);
                    dataToSend.append("images", img);
                });
            } else {
                console.log("   ⚠️  NO IMAGES TO APPEND!");
            }

            // Log FormData contents
            console.log("   FormData keys:", Array.from(dataToSend.keys()));
            console.log("   FormData entries:", Array.from(dataToSend.entries()));

            const response = await createWorkAnalysis(dataToSend);
            console.log("✅ Work Analysis Created:", response);
            
            setSuccessMsg("Work Analysis Submitted Successfully!");
            setDisplayAnalysis(response);

            // Update ticket status directly (same pattern as TicketList's handleMaterialToggle)
            try {
                const ticketId = formData.ticket_id;
                const statusName = formData.material_required === "Yes" ? "Material Request" : "Material Approved";
                
                console.log("🔄 Updating ticket status after form submission");
                console.log("   Status Name:", statusName);
                console.log("   Available Statuses:", ticketStatuses);
                
                // Find exact status match from master list
                let statusId = null;
                let statusObj = null;
                if (ticketStatuses && ticketStatuses.length > 0) {
                    statusObj = ticketStatuses.find((s) => String(s.name).toLowerCase() === String(statusName).toLowerCase());
                    statusId = statusObj?._id || statusObj?.id || null;
                    console.log("   Found Status Object:", statusObj);
                }
                
                const updatePayload = statusId ? { status_id: statusId } : { status: statusName };
                console.log("   Update Payload:", updatePayload);
                
                await updateTicket(ticketId, updatePayload);
                console.log("🟢 Ticket status updated to:", statusName);
                
                // Update selectedTicket state immediately
                if (selectedTicket && String(selectedTicket._id) === String(ticketId)) {
                    const updatedTicket = {
                        ...selectedTicket,
                        status_id: statusObj ? { _id: statusObj._id, name: statusObj.name } : { name: statusName },
                        status: statusName,
                    };
                    setSelectedTicket(updatedTicket);
                    console.log("✅ Selected ticket updated in state");
                }
            } catch (statusError) {
                console.error("⚠️ Failed to update ticket status:", statusError);
                // Don't fail the whole submission if status update fails
            }

            // Reset form completely
            resetForm();

            // Notify parent component
            if (onAnalysisCreated) {
                console.log("📞 Calling onAnalysisCreated callback");
                onAnalysisCreated();
            }

            // Show success message for 3 seconds then clear it
            setTimeout(() => {
                setSuccessMsg("");
            }, 3000);

            if (onSuccess) setTimeout(onSuccess, 1500);
        } catch (error) {
            console.error("❌ Error submitting work analysis:", error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return "N/A";
        try {
            return new Date(dateString).toLocaleString();
        } catch {
            return "Invalid Date";
        }
    };

    return (
        <>
            {/* Success Message */}
            {successMsg && (
                <div className="wa-success-banner">
                    <div className="wa-success-content">
                        <span className="wa-success-icon">✓</span>
                        <span>{successMsg}</span>
                    </div>
                </div>
            )}

            {/* Form Section */}
            <div className="wa-form-container">
                <div className="wa-form-card">
                    <div className="wa-form-header">
                        {successMsg && (
                            <button
                                type="button"
                                className="wa-create-another-btn"
                                onClick={resetForm}>
                                Create Another
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="wa-form">
                        <div className="wa-form-grid">
                            {/* Ticket ID Dropdown */}
                            <div className="wa-group">
                                <label>Select Ticket *</label>
                                {ticketsLoading ? (
                                    <p className="wa-loading">
                                        Loading tickets...
                                    </p>
                                ) : ticketId ? (
                                    // If a specific ticketId was provided, show it as a single, non-editable option
                                    <select
                                        value={formData.ticket_id}
                                        className="wa-select"
                                        disabled
                                        aria-readonly="true">
                                        <option
                                            value={
                                                formData.ticket_id ||
                                                safeString(ticketId)
                                            }>
                                            {selectedTicket &&
                                            selectedTicket.ticket_id
                                                ? safeString(
                                                      selectedTicket.ticket_id,
                                                  )
                                                : ticketTitle ||
                                                  safeString(ticketId)}
                                            {selectedTicket &&
                                            selectedTicket.title
                                                ? ` - ${safeString(selectedTicket.title)}`
                                                : ""}
                                        </option>
                                    </select>
                                ) : (
                                    <select
                                        value={formData.ticket_id}
                                        onChange={handleTicketChange}
                                        className="wa-select"
                                        required>
                                        <option value="">
                                            -- Select a Ticket --
                                        </option>
                                        {tickets.map((ticket) => (
                                            <option
                                                key={safeString(ticket?._id)}
                                                value={safeString(ticket?._id)}>
                                                {safeString(ticket?.ticket_id)}{" "}
                                                -{" "}
                                                {safeString(
                                                    ticket?.title,
                                                    "No Title",
                                                )}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* Worker Name */}
                            <div className="wa-group">
                                <label>Worker Name *</label>
                                <input
                                    type="text"
                                    value={user?.name || "Not logged in"}
                                    disabled
                                    className="wa-input"
                                    style={{
                                        backgroundColor: "#f3f4f6",
                                        cursor: "not-allowed",
                                    }}
                                />
                                
                            </div>
                        </div>

                        {/* Selected Ticket Details */}
                        {selectedTicket && (
                            <div className="wa-ticket-details">
                                <h4>Ticket Information</h4>
                                <div className="wa-ticket-grid">
                                    <div className="wa-detail-row">
                                        <span className="wa-label">
                                            Ticket ID:
                                        </span>
                                        <span className="wa-value">
                                            {safeString(
                                                selectedTicket?.ticket_id,
                                            )}
                                        </span>
                                    </div>
                                    <div className="wa-detail-row">
                                        <span className="wa-label">Title:</span>
                                        <span className="wa-value">
                                            {safeString(selectedTicket?.title)}
                                        </span>
                                    </div>
                                    <div className="wa-detail-row">
                                        <span className="wa-label">
                                            Status:
                                        </span>
                                        <span
                                            className={`wa-status-badge ${safeString(selectedTicket?.status_id?.name || selectedTicket?.status).toLowerCase()}`}
                                            style={{
                                                background: (() => {
                                                    const status = safeString(selectedTicket?.status_id?.name || selectedTicket?.status).toLowerCase();
                                                    if (status.includes("closed")) return "#f3f4f6";
                                                    if (status.includes("progress")) return "#e0e7ff";
                                                    if (status.includes("resolved")) return "#dcfce7";
                                                    return "#dbeafe";
                                                })(),
                                                color: (() => {
                                                    const status = safeString(selectedTicket?.status_id?.name || selectedTicket?.status).toLowerCase();
                                                    if (status.includes("closed")) return "#4b5563";
                                                    if (status.includes("progress")) return "#3730a3";
                                                    if (status.includes("resolved")) return "#166534";
                                                    return "#1e40af";
                                                })(),
                                                padding: "6px 12px",
                                                borderRadius: "6px",
                                                fontSize: "12px",
                                                fontWeight: "600"
                                            }}>
                                            {safeString(
                                                selectedTicket?.status_id?.name || selectedTicket?.status,
                                                "Unknown",
                                            )}
                                        </span>
                                    </div>
                                    <div className="wa-detail-row">
                                        <span className="wa-label">
                                            Assigned To:
                                        </span>
                                        <span className="wa-value">
                                            {selectedTicket?.assigned_to &&
                                            selectedTicket.assigned_to.length >
                                                0
                                                ? selectedTicket.assigned_to
                                                      .map((u) =>
                                                          safeString(
                                                              u?.name || u?._id,
                                                          ),
                                                      )
                                                      .join(", ")
                                                : "Not Assigned"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Material Required Toggle */}
                        <div className="wa-toggle-group">
                            <label>Material Required?</label>
                            <div className="wa-toggle-switch">
                                <button
                                    type="button"
                                    className={`wa-toggle-btn ${formData.material_required === "Yes" ? "active" : ""}`}
                                    onClick={() => handleToggle("Yes")}>
                                    Yes
                                </button>
                                <button
                                    type="button"
                                    className={`wa-toggle-btn ${formData.material_required === "No" ? "active" : ""}`}
                                    onClick={() => handleToggle("No")}>
                                    No
                                </button>
                            </div>
                        </div>

                        {/* Analysis Status Display */}
                        <div className="wa-status-display">
                            <div className="wa-detail-row">
                                <span className="wa-label">Analysis Status:</span>
                                <span
                                    className={`wa-status-badge ${formData.analysis_status.toLowerCase().replace(/ /g, "-")}`}
                                    style={{
                                        background: formData.analysis_status === "Approved" ? "#dcfce7" : "#fef3c7",
                                        color: formData.analysis_status === "Approved" ? "#166534" : "#92400e",
                                        padding: "6px 12px",
                                        borderRadius: "6px",
                                        fontSize: "12px",
                                        fontWeight: "600"
                                    }}>
                                    {formData.analysis_status}
                                </span>
                            </div>
                        </div>

                        {/* Conditional Section */}
                        {formData.material_required === "Yes" && (
                            <div className="wa-conditional-section">
                                <div className="wa-group">
                                    <label>Material Description</label>
                                    <textarea
                                        rows="3"
                                        placeholder="Describe the materials needed..."
                                        value={formData.material_description}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                material_description:
                                                    e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </div>

                                <div className="wa-group">
                                    <label>Upload Images (Max 5)</label>
                                    <div className="wa-upload-zone">
                                        <input
                                            type="file"
                                            id="img-upload"
                                            multiple
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            style={{ display: "none" }}
                                        />
                                        <label
                                            htmlFor="img-upload"
                                            className="wa-upload-label">
                                            <div className="wa-upload-icon">
                                                📁
                                            </div>
                                            <p>Click to select images</p>
                                            <span className="wa-small">
                                                Supports JPG, PNG
                                            </span>
                                        </label>
                                    </div>

                                    {images.length > 0 && (
                                        <div className="wa-previews">
                                            {images.map((img, idx) => (
                                                <div
                                                    key={idx}
                                                    className="wa-preview-item">
                                                    <img
                                                        src={URL.createObjectURL(
                                                            img,
                                                        )}
                                                        alt="preview"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="wa-remove-btn"
                                                        onClick={() =>
                                                            removeImage(idx)
                                                        }>
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="wa-submit-btn"
                            disabled={loading}>
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </form>
                </div>
            </div>

            {/* Detail Modal */}
            {displayAnalysis && (
                <div
                    className="wa-modal-overlay"
                    onClick={() => setDisplayAnalysis(null)}>
                    <div
                        className="wa-modal-content"
                        onClick={(e) => e.stopPropagation()}>
                        <div className="wa-modal-header">
                            <h3>Analysis Details</h3>
                            <button
                                className="wa-modal-close"
                                onClick={() => setDisplayAnalysis(null)}>
                                ×
                            </button>
                        </div>
                        <div className="wa-modal-body">
                            <div className="wa-details-grid">
                                <div className="wa-detail-item">
                                    <label>Analysis ID:</label>
                                    <span>
                                        {safeString(
                                            displayAnalysis?.analysis_id,
                                        )}
                                    </span>
                                </div>
                                <div className="wa-detail-item">
                                    <label>Ticket ID:</label>
                                    <span>
                                        {safeString(displayAnalysis?.ticket_id)}
                                    </span>
                                </div>
                                <div className="wa-detail-item">
                                    <label>Worker ID:</label>
                                    <span>
                                        {safeString(displayAnalysis?.worker_id)}
                                    </span>
                                </div>
                                <div className="wa-detail-item">
                                    <label>Material Required:</label>
                                    <span>
                                        {safeString(
                                            displayAnalysis?.material_required,
                                        )}
                                    </span>
                                </div>
                                <div className="wa-detail-item full-width">
                                    <label>Material Description:</label>
                                    <span>
                                        {safeString(
                                            displayAnalysis?.material_description,
                                            "N/A",
                                        )}
                                    </span>
                                </div>
                                <div className="wa-detail-item">
                                    <label>Uploaded Images:</label>
                                    <span>
                                        {displayAnalysis?.uploaded_images
                                            ?.length || 0}{" "}
                                        files
                                    </span>
                                </div>
                                <div className="wa-detail-item">
                                    <label>Analysis Status:</label>
                                    <span
                                        style={{
                                            background: displayAnalysis?.material_required === "Yes" ? "#fef3c7" : "#dcfce7",
                                            color: displayAnalysis?.material_required === "Yes" ? "#92400e" : "#166534",
                                            padding: "6px 12px",
                                            borderRadius: "6px",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            display: "inline-block"
                                        }}>
                                        {displayAnalysis?.material_required === "Yes" ? "pending" : "Approved"}
                                    </span>
                                </div>
                                <div className="wa-detail-item">
                                    <label>Created At:</label>
                                    <span>
                                        {formatDateTime(
                                            displayAnalysis?.created_at,
                                        )}
                                    </span>
                                </div>
                                {displayAnalysis?.approved_by && (
                                    <div className="wa-detail-item">
                                        <label>Approved By:</label>
                                        <span>
                                            {typeof displayAnalysis.approved_by ===
                                            "object"
                                                ? safeString(
                                                      displayAnalysis
                                                          .approved_by?.name,
                                                  )
                                                : safeString(
                                                      displayAnalysis.approved_by,
                                                  )}
                                        </span>
                                    </div>
                                )}
                                {displayAnalysis?.approved_at && (
                                    <div className="wa-detail-item">
                                        <label>Approved At:</label>
                                        <span>
                                            {formatDateTime(
                                                displayAnalysis.approved_at,
                                            )}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default WorkAnalysisForm;
