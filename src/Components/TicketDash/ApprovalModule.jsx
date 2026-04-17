import React, { useState, useEffect, useRef } from "react";
import { createApproval } from "@/Components/Api/TicketApi/approvalAPI";
import { getTickets, updateTicket } from "@/Components/Api/TicketApi/ticketAPI";
import { getUsers } from "@/Components/Api/TicketApi/userAPI";
import { getTicketStatuses } from "@/Components/Api/MasterApi/ticketStatusApi";
import { updateWorkAnalysis } from "@/Components/Api/TicketApi/workAnalysisAPI";
import API_ENDPOINTS from "@/config/apiConfig";
import "./approvalForm.css";

const ApprovalModule = ({
    ticketId,
    ticketTitle,
    onApprovalSuccess,
    approverId,
    initialData,
}) => {
    // Get logged-in user from localStorage
    const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");

    // Helper to extract user IDs from assigned_to array (handles both ID strings and user objects)
    const extractUserIds = (assignedTo) => {
        if (!assignedTo) return [];
        if (!Array.isArray(assignedTo)) return [];
        return assignedTo.map(item => {
            if (typeof item === 'string') return item;
            if (typeof item === 'object' && (item._id || item.id)) return item._id || item.id;
            return item;
        });
    };

    // Build initial form data with prefill support
    const buildInitialFormData = () => {
        // First, try to restore from localStorage if available
        if (ticketId && !initialData) {
            const key = `approval_form_${ticketId}`;
            const saved = localStorage.getItem(key);
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch (e) {
                    console.warn("Failed to restore draft from localStorage");
                }
            }
        }

        const base = {
            ticket_id: ticketId || "",
            approver_id: approverId || loggedInUser?.id || "",
            approval_status: "Approved",
            assigned_to: [],
            remarks: "",
            approved_at: new Date().toISOString(),
        };

        // If initialData provided (editing existing approval), prefill those values
        if (initialData) {
            base.ticket_id = initialData.ticket_id?._id || initialData.ticket_id || base.ticket_id;
            base.approver_id = initialData.approver_id || base.approver_id;
            base.approval_status = initialData.approval_status || base.approval_status;
            base.assigned_to = extractUserIds(initialData.assigned_to);
            base.remarks = initialData.remarks !== undefined ? initialData.remarks : "";
            base.approved_at = initialData.approved_at || base.approved_at;
        }
        return base;
    };

    const [formData, setFormData] = useState(buildInitialFormData());

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });
    const [toastVisible, setToastVisible] = useState(false);
    const [toastText, setToastText] = useState("");
    const [toastType, setToastType] = useState("");
    const [tickets, setTickets] = useState([]);
    const [users, setUsers] = useState([]);
    const [ticketStatuses, setTicketStatuses] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Auto-save form data to localStorage whenever it changes
    useEffect(() => {
        if (!ticketId) return;
        const key = `approval_form_${ticketId}`;
        localStorage.setItem(key, JSON.stringify(formData));
    }, [formData, ticketId]);

    // Fetch tickets and users on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setDataLoading(true);
                const [ticketsData, usersData, statusesData] = await Promise.all([
                    getTickets(),
                    getUsers(),
                    getTicketStatuses(),
                ]);
                setTickets(ticketsData || []);
                setUsers(usersData || []);
                setTicketStatuses(statusesData || []);
            } catch (error) {
                console.error("Error fetching data:", error);
                setMessage({ text: "Failed to load data", type: "error" });
            } finally {
                setDataLoading(false);
            }
        };
        fetchData();
    }, []);

    // Sync form data when initialData changes (for editing/reopening)
    useEffect(() => {
        if (!initialData) return;
        console.log("ApprovalModule: Syncing initialData:", initialData);
        setFormData((fd) => {
            const newFormData = {
                ticket_id: initialData.ticket_id?._id || initialData.ticket_id || fd.ticket_id,
                approver_id: initialData.approver_id || fd.approver_id,
                approval_status: initialData.approval_status || fd.approval_status,
                assigned_to: extractUserIds(initialData.assigned_to),
                remarks: initialData.remarks !== undefined ? initialData.remarks : fd.remarks,
                approved_at: initialData.approved_at || fd.approved_at,
            };
            console.log("ApprovalModule: New form data:", newFormData);
            return newFormData;
        });
    }, [initialData]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Handle User Selection from Dropdown
    const handleUserSelection = (userId) => {
        setFormData((prev) => {
            const current = prev.assigned_to;
            if (current.includes(userId)) {
                // Remove user
                return {
                    ...prev,
                    assigned_to: current.filter((id) => id !== userId),
                };
            } else {
                // Add user
                return { ...prev, assigned_to: [...current, userId] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.ticket_id) {
            setMessage({ text: "Ticket is required", type: "error" });
            return;
        }
        if (!formData.approver_id) {
            setMessage({ text: "Approver is required", type: "error" });
            return;
        }
        if (formData.assigned_to.length === 0) {
            setMessage({
                text: "Please select at least one user to assign to",
                type: "error",
            });
            return;
        }

        setLoading(true);
        setMessage({ text: "", type: "" });

        try {
            console.log("Starting approval process...");

            // 1. Create approval
            console.log("Step 1: Creating approval...");
            const approvalData = await createApproval(formData);
            console.log("Approval created successfully:", approvalData);

            // 2. Update ticket with approval status, assigned users and map status
            console.log("Step 2: Updating ticket...");
            const ticketUpdateData = {
                approval_status: formData.approval_status,
                assigned_to: formData.assigned_to,
                approver_id: formData.approver_id,
                approved_at: formData.approved_at,
            };

            // Determine ticket status_id based on approval result (e.g., Approved -> 'Approved')
            try {
                const ticketObj = tickets.find(
                    (t) => String(t._id) === String(formData.ticket_id),
                );
                const companyId =
                    ticketObj?.company_id?._id || ticketObj?.company_id || null;

                const desiredStatusKey = String(
                    (formData.approval_status || "").toLowerCase(),
                );

                if (desiredStatusKey) {
                    // Prefer a matching status with same company_id, fallback to global
                    let found = ticketStatuses.find((s) => {
                        const sName = String(s.name || "").toLowerCase();
                        if (!sName.includes(desiredStatusKey)) return false;
                        if (!s.company_id) return true;
                        const sComp = s.company_id._id || s.company_id;
                        return String(sComp) === String(companyId);
                    });

                    if (!found) {
                        found = ticketStatuses.find((s) =>
                            String(s.name || "").toLowerCase().includes(desiredStatusKey),
                        );
                    }

                    if (found && (found._id || found.id)) {
                        ticketUpdateData.status_id = found._id || found.id;
                    }
                }
            } catch (err) {
                console.warn("Failed to map approval to ticket status_id:", err);
            }

            console.log("Ticket update data:", ticketUpdateData);
            const ticketUpdateResponse = await updateTicket(
                formData.ticket_id,
                ticketUpdateData,
            );
            console.log("Ticket updated successfully:", ticketUpdateResponse);

            // 3. If approval status is "Approved", also update related work analysis
            // Set material_required to "No" so it appears in Material Approved page
            if (String(formData.approval_status).toLowerCase() === "approved") {
                try {
                    console.log("Step 3: Updating work analysis for material approved...");
                    // Find and update the work analysis for this ticket
                    const ticketObj = tickets.find(t => String(t._id) === String(formData.ticket_id));
                    if (ticketObj) {
                        // We need to get the work analysis for this ticket
                        // For now, we can try to update it by querying server, or pass it through props
                        // The safest approach is to fetch work analyses and find the matching one
                        try {
                            const response = await fetch(API_ENDPOINTS.WORK_ANALYSIS, {
                                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                            });
                            const allAnalyses = await response.json();
                            
                            // Find work analysis for this ticket
                            const matchingAnalysis = allAnalyses.find(a => {
                                const aTicketId = a.ticket_id?._id || a.ticket_id;
                                return String(aTicketId) === String(formData.ticket_id);
                            });
                            
                            if (matchingAnalysis) {
                                await updateWorkAnalysis(matchingAnalysis._id, { 
                                    material_required: "No",
                                    approval_status: "Approved"
                                });
                                console.log("Work analysis updated - material_required set to 'No'");
                            }
                        } catch (err) {
                            console.warn("Could not update work analysis:", err);
                            // Don't fail the approval process if work analysis update fails
                        }
                    }
                } catch (err) {
                    console.warn("Failed to update work analysis:", err);
                }
            }

            setMessage({
                text: "Approval recorded successfully and ticket updated!",
                type: "success",
            });

            // Show popup toast message
            setToastText("Approval recorded successfully and ticket updated!");
            setToastType("success");
            setToastVisible(true);
            setTimeout(() => setToastVisible(false), 3000);

            // After successful submission, keep all form data intact
            setTimeout(() => {
                if (onApprovalSuccess) {
                    console.log("Calling onApprovalSuccess callback...");
                    onApprovalSuccess();
                }
                // Form data is NOT reset - it will remain as is
                // User can see their previous submission when form reopens
            }, 1500);
        } catch (error) {
            console.error("Approval process error:", error);
            setMessage({ text: error.message, type: "error" });
        } finally {
            setLoading(false);
        }
    };

    // Get selected user names for display
    const getSelectedUserNames = () => {
        return users
            .filter((user) => formData.assigned_to.includes(user._id))
            .map((user) => user.name)
            .join(", ");
    };

    // Display-friendly ticket id (prefer ticket_number or ticket_id over raw _id)
    const getDisplayTicketId = (id) => {
        try {
            if (!id) return "";
            const found = tickets.find((t) => String(t._id) === String(id));
            if (found) return found.ticket_number || found.ticket_id || id;
            return id;
        } catch (err) {
            return id;
        }
    };

    return (
        <div className="approval-container">
            <div className="approval-card">

                {message.text && (
                    <div className={`alert ${message.type}`}>
                        {message.text}
                    </div>
                )}

                {/* Toast Popup */}
                {toastVisible && (
                    <div className={`toast ${toastType}`} role="status">
                        {toastText}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="approval-form">
                    {dataLoading ? (
                        <div className="loading">Loading data...</div>
                    ) : (
                        <>
                            <div className="form-grid">
                                {/* 1. Ticket ID - Dropdown */}
                                <div className="form-group">
                                    <label>Ticket ID *</label>
                                    {ticketId ? (
                                        <>
                                            <input
                                                type="text"
                                                value={
                                                    getDisplayTicketId(
                                                        ticketId,
                                                    ) || "Loading..."
                                                }
                                                disabled
                                                className="form-control"
                                            />
                                            <small className="form-text text-muted">
                                                Selected from ticket list
                                            </small>
                                        </>
                                    ) : (
                                        <select
                                            value={formData.ticket_id}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    ticket_id: e.target.value,
                                                })
                                            }
                                            className="form-control"
                                            required>
                                            <option value="">
                                                Select a Ticket
                                            </option>
                                            {tickets.map((ticket) => (
                                                <option
                                                    key={ticket._id}
                                                    value={ticket._id}>
                                                    {ticket.ticket_number} -{" "}
                                                    {ticket.title}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                {/* 2. Approver ID - Disabled (Auto from logged-in user) */}
                                <div className="form-group">
                                    <label>Approver * (You)</label>
                                    <input
                                        type="text"
                                        value={
                                            loggedInUser?.name ||
                                            "Not logged in"
                                        }
                                        disabled
                                        className="form-control"
                                    />
                                    <small className="form-text text-muted">
                                        Auto-set to logged-in user
                                    </small>
                                </div>

                                {/* 3. Approval Status */}
                                <div className="form-group full-width">
                                    <label>Approval Status *</label>
                                    <div className="radio-group">
                                        <label className="radio-label">
                                            <input
                                                type="radio"
                                                name="status"
                                                value="Approved"
                                                checked={
                                                    formData.approval_status ===
                                                    "Approved"
                                                }
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        approval_status:
                                                            e.target.value,
                                                    })
                                                }
                                            />
                                            <div className="radio-option">
                                                <span>✓</span> Approved
                                            </div>
                                        </label>
                                        <label className="radio-label">
                                            <input
                                                type="radio"
                                                name="status"
                                                value="Not Approved"
                                                checked={
                                                    formData.approval_status ===
                                                    "Not Approved"
                                                }
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        approval_status:
                                                            e.target.value,
                                                    })
                                                }
                                            />
                                            <div className="radio-option">
                                                <span>✗</span> Not Approved
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* 4. Dropdown Multiselect for Assigned To */}
                                <div
                                    className="form-group full-width"
                                    ref={dropdownRef}>
                                    <label>Assign To (Select Agents)</label>
                                    <div className="dropdown-container">
                                        <div
                                            className="dropdown-header"
                                            onClick={() =>
                                                setDropdownOpen(!dropdownOpen)
                                            }>
                                            {formData.assigned_to.length > 0
                                                ? getSelectedUserNames()
                                                : "Select agents..."}
                                            <span
                                                className={`dropdown-arrow ${dropdownOpen ? "open" : ""}`}></span>
                                        </div>
                                        {dropdownOpen && (
                                            <div className="dropdown-list">
                                                {users.map((user) => (
                                                    <div
                                                        key={user._id}
                                                        className={`dropdown-item ${formData.assigned_to.includes(user._id) ? "selected" : ""}`}
                                                        onClick={() =>
                                                            handleUserSelection(
                                                                user._id,
                                                            )
                                                        }>
                                                        <div className="user-info">
                                                            <span className="user-avatar">
                                                                {user.name.charAt(
                                                                    0,
                                                                )}
                                                            </span>
                                                            {user.name}
                                                        </div>
                                                        {formData.assigned_to.includes(
                                                            user._id,
                                                        ) && (
                                                            <span className="check-icon">
                                                                ✓
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {formData.assigned_to.length === 0 && (
                                        <span className="error-text">
                                            Please select at least one user.
                                        </span>
                                    )}
                                </div>

                                {/* 5. Remarks */}
                                <div className="form-group full-width">
                                    <label>Remarks</label>
                                    <textarea
                                        placeholder="Enter approval notes..."
                                        value={formData.remarks}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                remarks: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                {/* 6. Approved At */}
                                <div className="form-group full-width">
                                    <label>Approved At</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.approved_at.slice(
                                            0,
                                            16,
                                        )}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                approved_at: new Date(
                                                    e.target.value,
                                                ).toISOString(),
                                            })
                                        }
                                        className="form-control"
                                    />
                                </div>
                            </div>

                            <div className="form-actions">
                                <button
                                    type="submit"
                                    className="submit-btn"
                                    disabled={loading}>
                                    {loading
                                        ? "Saving..."
                                        : "Save"}
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ApprovalModule;