import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getTickets, updateTicket, deleteTicket } from "@/Components/Api/TicketApi/ticketAPI";
import { getWorkAnalysis, updateWorkAnalysis } from "@/Components/Api/TicketApi/workAnalysisAPI";
import { getTicketStatuses } from "@/Components/Api/MasterApi/ticketStatusApi";
import { decryptTicketId } from "../../_helper/encryption";
import { normalizeImageUrl } from "@/_helper/imageUrl";
import API_ENDPOINTS from "@/config/apiConfig";
import CreateTicket from "./CreateTicket";
import ApprovalModule from "./ApprovalModule";
import WorkAnalysisForm from "./WorkAnalysisForm";
import "./ticketForm.css";

// --- SVG Icons ---
const SearchIcon = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

const CloseIcon = () => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const CheckIcon = () => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

const TrashIcon = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
);

const CalendarIcon = () => (
    <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
);

const UserIcon = () => (
    <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);

const BuildingIcon = () => (
    <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
);

const TicketList = () => {
    const [searchParams] = useSearchParams();
    const statusFilter = searchParams.get('status');
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [ticketStatuses, setTicketStatuses] = useState([]);
    const [toast, setToast] = useState({
        show: false,
        message: "",
        type: "success",
    });

    // Modal States
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [viewTicket, setViewTicket] = useState(null);
    const [editTicket, setEditTicket] = useState(null);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [selectedTicketForApproval, setSelectedTicketForApproval] =
        useState(null);

    // Work Analysis Modal State
    const [showWorkAnalysisModal, setShowWorkAnalysisModal] = useState(false);
    const [selectedTicketForAnalysis, setSelectedTicketForAnalysis] =
        useState(null);
    const [workAnalyses, setWorkAnalyses] = useState([]);
    const [loadingAnalyses, setLoadingAnalyses] = useState(false);
    const [selectedAnalysis, setSelectedAnalysis] = useState(null);

    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: null,
    });

    // --- 1. Fetch Data ---
    const [showAssignedOnly, setShowAssignedOnly] = useState(
        localStorage.getItem("assignedOnly") === "true",
    );

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const currentUser = JSON.parse(
                localStorage.getItem("user") || "{}",
            );
            const assignedOnlyFlag =
                showAssignedOnly ||
                localStorage.getItem("assignedOnly") === "true";
            const data = await getTickets(assignedOnlyFlag);
            const fetchedTickets = Array.isArray(data) ? data : data.data || [];
            console.log("✅ Fetched", fetchedTickets.length, "tickets");
            
            // Log tickets with images
            const withImages = fetchedTickets.filter(t => t.image);
            if (withImages.length > 0) {
                console.log("🖼️ Tickets with images:", withImages.length);
                withImages.slice(0, 2).forEach((t, i) => {
                    console.log(`   Ticket ${i+1} (_id=${t._id || t.id}): image="${t.image}"`);
                });
            }
            
            setTickets(fetchedTickets);
        } catch (error) {
            console.error("Error fetching tickets:", error);
            showToast("Failed to load tickets", "error");
        } finally {
            setLoading(false);
        }
    };

    const fetchWorkAnalyses = async () => {
        setLoadingAnalyses(true);
        try {
            const data = await getWorkAnalysis();
            const analyses = Array.isArray(data) ? data : data.data || [];
            setWorkAnalyses(analyses);
        } catch (error) {
            console.error("Error fetching work details:", error);
        } finally {
            setLoadingAnalyses(false);
        }
    };

    const fetchTicketStatuses = async () => {
        try {
            const data = await getTicketStatuses();
            setTicketStatuses(Array.isArray(data) ? data : data.data || []);
        } catch (error) {
            console.error("Error fetching ticket statuses:", error);
        }
    };

    useEffect(() => {
        fetchTickets();
        fetchWorkAnalyses();
        fetchTicketStatuses();
    }, []);

    // Log when a ticket is viewed (for debugging image URLs)
    useEffect(() => {
        if (viewTicket) {
            console.log("📋 Ticket viewed - ID:", viewTicket._id || viewTicket.id);
            console.log("   Image field:", viewTicket.image);
            if (viewTicket.image) {
                const normalized = normalizeImageUrl(viewTicket.image);
                console.log("   Normalized URL:", normalized);
            }
        }
    }, [viewTicket]);

    // --- 2. Helper: Safe Getters ---
    const getPriorityName = (ticket) => {
        return ticket.priority_id?.name || ticket.priority || "Unknown";
    };

    const getStatusName = (ticket) => {
        return ticket.status_id?.name || ticket.status || "Unknown";
    };

    const getCompanyName = (ticket) => {
        return ticket.company_id?.name || ticket.institution_id?.name || "-";
    };

    const getAnalysesForTicket = (ticket) => {
        if (!ticket || !workAnalyses || workAnalyses.length === 0) return [];
        const ticketIdStr = ticket._id
            ? String(ticket._id)
            : String(ticket.ticket_id || ticket.ticket_id);
        const ticketHumanId = ticket.ticket_id
            ? String(ticket.ticket_id)
            : null;
        return workAnalyses.filter((a) => {
            const t = a.ticket_id;
            const refId =
                t && typeof t === "object"
                    ? String(t._id || t)
                    : String(t || "");
            const refHuman =
                t && typeof t === "object" && t.ticket_id
                    ? String(t.ticket_id)
                    : null;

            return (
                refId === ticketIdStr ||
                (ticketHumanId && refId === String(ticketHumanId)) ||
                (refHuman && ticketHumanId && refHuman === ticketHumanId)
            );
        });
    };

    // --- 3. UI Interaction Logic ---
    const showToast = (message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: "", type }), 3000);
    };

    const openConfirmModal = (title, message, onConfirm) => {
        setConfirmModal({ isOpen: true, title, message, onConfirm });
    };

    const handleDelete = (ticket) => {
        openConfirmModal(
            "Delete Ticket",
            `Are you sure you want to delete ticket ${ticket.ticket_id}?`,
            async () => {
                try {
                    await deleteTicket(ticket._id);
                    showToast("Ticket deleted successfully", "success");
                    fetchTickets();
                } catch (err) {
                    showToast("Failed to delete ticket", "error");
                }
            },
        );
    };

   const normalize = (text) =>
  String(text).toLowerCase().replace(/\s+/g, " ").trim();

const handleTicketCreated = (statusName = "Raised") => {

    setShowCreateForm(false);
    setEditTicket(null);
    fetchTickets();

    console.log("STATUS RECEIVED 👉", statusName);
    const status = normalize(statusName);

    const statusMessages = {
        "closed": "🔒 Ticket closed successfully!",
        "material approved": "✅ Material approved successfully!",
        "material request": "📋 Material request created successfully!",
        "working in progress": "⏳ Ticket marked as working in progress!",
        "work completed": "✔️ Work completed successfully!",
        "raised": "🚀 Ticket raised successfully!",
        "approved": "✅ Ticket approved successfully!",
    };

    const toastMessage =
        statusMessages[status] ||
        `🎫 Ticket created with ${statusName} successfully!`;

    showToast(toastMessage, "success");
};

    // Toggle material approval for a ticket's analysis -> updates ticket status and work analysis
    const handleMaterialToggle = async (analysis, makePending) => {
        try {
            const ticketId = viewTicket?._id || (analysis.ticket_id && (analysis.ticket_id._id || analysis.ticket_id));
            if (!ticketId) {
                showToast("Ticket not found for this analysis", "error");
                return;
            }

            // Map "Material Required" to "Material Request" and "Material Approved" stays the same
            const statusName = makePending ? "Material Request" : "Material Approved";
            const ticketObj = tickets.find((t) => String(t._id) === String(ticketId));
            const companyId = ticketObj?.company_id?._id || ticketObj?.company_id || null;

            console.log("Looking for status:", statusName);
            console.log("Available ticketStatuses:", ticketStatuses);

            // Find exact status match from master list
            let statusId = null;
            let statusObj = null;
            if (ticketStatuses && ticketStatuses.length > 0) {
                // Look for exact match first
                statusObj = ticketStatuses.find((s) => String(s.name).toLowerCase() === String(statusName).toLowerCase());
                statusId = statusObj?._id || statusObj?.id || null;
                console.log("Found status:", statusObj);
            }

            const updatePayload = statusId ? { status_id: statusId } : { status: statusName };
            console.log("Sending payload:", updatePayload);
            await updateTicket(ticketId, updatePayload);

            // Update the work analysis material_required field
            const analysisId = analysis._id || analysis.analysis_id;
            if (analysisId) {
                const materialValue = makePending ? "Yes" : "No";
                await updateWorkAnalysis(analysisId, { material_required: materialValue });
                console.log(`Work analysis ${analysisId} material_required updated to ${materialValue}`);
            }

            showToast(`Ticket status updated to ${statusName}`, "success");
            
            // Update viewTicket immediately with new status
            if (viewTicket && String(viewTicket._id) === String(ticketId)) {
                const updatedViewTicket = {
                    ...viewTicket,
                    status_id: statusObj ? { _id: statusObj._id, name: statusObj.name } : { name: statusName },
                    status: statusName,
                };
                console.log("Updated viewTicket:", updatedViewTicket);
                setViewTicket(updatedViewTicket);
            }

            // Re-fetch lists in background
            fetchTickets();
            fetchWorkAnalyses();
        } catch (err) {
            console.error("Failed to update ticket status:", err);
            showToast("Failed to update ticket status", "error");
        }
    };

    // Close ticket - only available to the person who raised the ticket
    const handleCloseTicket = async () => {
        if (!viewTicket) {
            showToast("No ticket selected", "error");
            return;
        }

        // Get current user from localStorage
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        // Use 'id' or '_id' - localStorage uses 'id', but database uses '_id'
        const currentUserId = currentUser.id || currentUser._id;
        const raisedByUserId = viewTicket.raised_by?._id || viewTicket.raised_by;

        console.log("🔍 Close Ticket Debug:");
        console.log("   Current User ID:", currentUserId, "Type:", typeof currentUserId);
        console.log("   Current User Object:", currentUser);
        console.log("   Raised By ID:", raisedByUserId, "Type:", typeof raisedByUserId);
        console.log("   Raised By Object:", viewTicket.raised_by);
        console.log("   Match:", String(currentUserId) === String(raisedByUserId));

        // Check if current user is the one who raised the ticket
        if (String(currentUserId) !== String(raisedByUserId)) {
            showToast("Only the person who raised this ticket can close it", "error");
            return;
        }

        try {
            // Find "Closed" status
            let statusId = null;
            let statusObj = null;
            if (ticketStatuses && ticketStatuses.length > 0) {
                statusObj = ticketStatuses.find((s) => String(s.name).toLowerCase() === "closed");
                statusId = statusObj?._id || statusObj?.id || null;
            }

            const closedAtTimestamp = new Date().toISOString();
            const updatePayload = {
                ...(statusId ? { status_id: statusId } : { status: "Closed" }),
                closed_at: closedAtTimestamp,
            };

            await updateTicket(viewTicket._id, updatePayload);
            showToast("Ticket closed successfully", "success");

            // Update viewTicket immediately
            const updatedViewTicket = {
                ...viewTicket,
                status_id: statusObj ? { _id: statusObj._id, name: statusObj.name } : { name: "Closed" },
                status: "Closed",
                closed_at: closedAtTimestamp,
            };
            setViewTicket(updatedViewTicket);

            // Also update in the tickets array immediately (for table view)
            const updatedTickets = tickets.map((t) =>
                String(t._id) === String(viewTicket._id)
                    ? {
                          ...t,
                          status_id: statusObj ? { _id: statusObj._id, name: statusObj.name } : { name: "Closed" },
                          status: "Closed",
                          closed_at: closedAtTimestamp,
                      }
                    : t,
            );
            setTickets(updatedTickets);

            // Re-fetch lists in background
            fetchTickets();
            fetchWorkAnalyses();
        } catch (err) {
            console.error("Failed to close ticket:", err);
            showToast("Failed to close ticket: " + err.message, "error");
        }
    };

    // --- 4. Filtering ---
    const filteredTickets = tickets.filter((ticket) => {
        const term = searchTerm.toLowerCase();
        const id = String(ticket.ticket_id || "").toLowerCase();
        const title = String(ticket.title || "").toLowerCase();
        const desc = String(ticket.description || "").toLowerCase();
        
        // Search term filter
        const matchesSearch = id.includes(term) || title.includes(term) || desc.includes(term);
        
        // Status filter from URL parameter
        const ticketStatus = getStatusName(ticket);
        const matchesStatusFilter = !statusFilter || ticketStatus.toLowerCase() === statusFilter.toLowerCase();
        
        return matchesSearch && matchesStatusFilter;
    });

    // --- 5. Render Logic ---
    if (loading)
        return (
            <div style={styles.pageContainer}>
                <div style={styles.spinnerContainer}>
                    <div style={styles.spinner}></div>
                    <p style={styles.loadingText}>Loading tickets...</p>
                </div>
            </div>
        );

    return (
        <div style={styles.pageContainer}>
            {/* --- Toast Notification --- */}
            {toast.show && (
                <div
                    style={{
                        ...styles.toast,
                        ...(toast.type === "error"
                            ? styles.toastError
                            : styles.toastSuccess),
                    }}>
                    <div style={styles.toastContent}>
                        {toast.type === "success" ? (
                            <CheckIcon />
                        ) : (
                            <span style={styles.errorIcon}>⚠</span>
                        )}
                        <span style={styles.toastMessage}>{toast.message}</span>
                    </div>
                    <button
                        style={styles.toastClose}
                        onClick={() =>
                            setToast({ show: false, message: "", type: "" })
                        }>
                        <CloseIcon />
                    </button>
                </div>
            )}

            {/* --- Confirmation Modal --- */}
            {confirmModal.isOpen && (
                <div style={styles.modalOverlay}>
                    <div style={styles.confirmModal}>
                        <div style={styles.confirmHeader}>
                            <h3 style={styles.confirmTitle}>
                                {confirmModal.title}
                            </h3>
                        </div>
                        <div style={styles.confirmBody}>
                            <p>{confirmModal.message}</p>
                        </div>
                        <div style={styles.confirmFooter}>
                            <button
                                onClick={() =>
                                    setConfirmModal({
                                        ...confirmModal,
                                        isOpen: false,
                                    })
                                }
                                style={styles.btnSecondary}>
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (confirmModal.onConfirm)
                                        confirmModal.onConfirm();
                                    setConfirmModal({
                                        ...confirmModal,
                                        isOpen: false,
                                    });
                                }}
                                style={styles.btnPrimary}>
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Create/Edit Ticket Modal --- */}
            {showCreateForm && (
                <div
                    style={styles.modalOverlay}
                    onClick={() => {
                        setShowCreateForm(false);
                        setEditTicket(null);
                    }}>
                    <div
                        style={styles.largeModal}
                        onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>
                                {editTicket
                                    ? "Edit Ticket"
                                    : "Create New Ticket"}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowCreateForm(false);
                                    setEditTicket(null);
                                }}
                                style={styles.iconBtn}>
                                <CloseIcon />
                            </button>
                        </div>
                        <div style={styles.modalBody}>
                            <CreateTicket
                                onTicketCreated={handleTicketCreated}
                                isEdit={!!editTicket}
                                initialData={editTicket}
                                onTicketUpdated={(statusName) => {
                                    setEditTicket(null);
                                    handleTicketCreated(statusName);
                                }}
                                onClose={() => {
                                    setShowCreateForm(false);
                                    setEditTicket(null);
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* --- View Ticket Modal --- */}
            {viewTicket && (
                <div
                    style={styles.modalOverlay}
                    onClick={() => setViewTicket(null)}>
                    <div
                        style={styles.viewModal}
                        onClick={(e) => e.stopPropagation()}>
                        <div style={styles.viewModalHeader}>
                            <h3 style={styles.viewModalTitle}>
                                Ticket Details
                            </h3>
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                {!viewTicket.closed_at && (() => {
                                    const statusName = getStatusName(viewTicket);
                                    const allowedStatusesForClosing = ["work completed", "resolved", "done", "closed"];
                                    const canClose = allowedStatusesForClosing.some(s => String(statusName).toLowerCase().includes(s));
                                    return canClose ? (
                                        <button
                                            onClick={handleCloseTicket}
                                            title="Close this ticket (only available to the person who raised it)"
                                            style={{
                                                padding: "8px 12px",
                                                borderRadius: 6,
                                                border: "1px solid #ef4444",
                                                background: "#fef2f2",
                                                color: "#dc2626",
                                                cursor: "pointer",
                                                fontSize: 12,
                                                fontWeight: 600,
                                                whiteSpace: "nowrap",
                                                transition: "all 0.2s"
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.background = "#fee2e2";
                                                e.target.style.color = "#991b1b";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.background = "#fef2f2";
                                                e.target.style.color = "#dc2626";
                                            }}>
                                            🔒 Close Ticket
                                        </button>
                                    ) : null;
                                })()}
                                <button
                                    onClick={() => setViewTicket(null)}
                                    style={styles.iconBtn}>
                                    <CloseIcon />
                                </button>
                            </div>
                        </div>
                        <div style={styles.viewModalBody}>
                            <div style={styles.ticketCard}>
                                <div style={styles.ticketHeader}>
                                    <div style={styles.ticketId}>
                                        <span style={styles.ticketIdLabel}>
                                            Ticket ID:
                                        </span>
                                        <span style={styles.ticketIdValue}>
                                            {viewTicket.ticket_id}
                                        </span>
                                    </div>
                                    <div style={styles.ticketStatusContainer}>
                                        <span
                                            style={{
                                                ...styles.badge,
                                                ...getPriorityStyle(
                                                    getPriorityName(viewTicket),
                                                ),
                                            }}>
                                            {getPriorityName(viewTicket)}
                                        </span>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <span
                                                style={{
                                                    ...styles.badge,
                                                    ...getStatusStyle(
                                                        getStatusName(viewTicket),
                                                    ),
                                                }}>
                                                {getStatusName(viewTicket)}
                                            </span>
                                            {viewTicket.closed_at && (
                                                <span style={{ fontSize: "12px", color: "#666", fontWeight: 500 }}>
                                                    📅 {new Date(viewTicket.closed_at).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div style={styles.ticketSection}>
                                    <h4 style={styles.sectionTitle}>
                                        Ticket Information
                                    </h4>
                                    <div style={styles.infoGrid}>
                                        <div style={styles.infoItem}>
                                            <h5 style={styles.infoLabel}>
                                                Title
                                            </h5>
                                            <p style={styles.infoValue}>
                                                {viewTicket.title}
                                            </p>
                                        </div>
                                        <div style={styles.infoItem}>
                                            <h5 style={styles.infoLabel}>
                                                Location
                                            </h5>
                                            <p style={styles.infoValue}>
                                                {viewTicket.location || "-"}
                                            </p>
                                        </div>
                                        <div style={styles.infoItem}>
                                            <h5 style={styles.infoLabel}>
                                                Description
                                            </h5>
                                            <p style={styles.infoValue}>
                                                {viewTicket.description}
                                            </p>
                                        </div>
                                        <div style={styles.infoItem}>
                                            <h5 style={styles.infoLabel}>
                                                <BuildingIcon /> Company
                                            </h5>
                                            <p style={styles.infoValue}>
                                                {getCompanyName(viewTicket) }
                                            </p>
                                        </div>
                                        <div style={styles.infoItem}>
                                            <h5 style={styles.infoLabel}>
                                                Department
                                            </h5>
                                            <p style={styles.infoValue}>
                                                {viewTicket.department_id
                                                    ?.name || "-"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div style={styles.ticketSection}>
                                    <h4 style={styles.sectionTitle}>
                                        People & Dates
                                    </h4>
                                    <div style={styles.infoGrid}>
                                        <div style={styles.infoItem}>
                                            <h5 style={styles.infoLabel}>
                                                <UserIcon /> Raised By
                                            </h5>
                                            <p style={styles.infoValue}>
                                                {viewTicket.raised_by?.name ||
                                                    "-"}
                                            </p>
                                        </div>
                                        <div style={styles.infoItem}>
                                            <h5 style={styles.infoLabel}>
                                                <CalendarIcon /> Created On
                                            </h5>
                                            <p style={styles.infoValue}>
                                                {new Date(
                                                    viewTicket.createdAt,
                                                ).toLocaleString()}
                                            </p>
                                        </div>
                                        {viewTicket.closed_at && (
                                            <div style={styles.infoItem}>
                                                <h5 style={styles.infoLabel}>
                                                    <CalendarIcon /> Closed On
                                                </h5>
                                                <p style={styles.infoValue}>
                                                    {new Date(
                                                        viewTicket.closed_at,
                                                    ).toLocaleString()}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {viewTicket.image && (
                                    <div style={styles.ticketSection}>
                                        <h4 style={styles.sectionTitle}>
                                            Attachment
                                        </h4>
                                        <div style={styles.imageContainer}>
                                            <img
                                                src={normalizeImageUrl(viewTicket.image)}
                                                alt="ticket attachment"
                                                style={styles.detailImage}
                                            />
                                        </div>
                                    </div>
                                )}
                                {/* Work Analysis List for this ticket */}
                                <div style={styles.ticketSection}>
                                    <h4 style={styles.sectionTitle}>
                                        Work Details
                                    </h4>
                                    {loadingAnalyses ? (
                                        <p style={{ color: "#6b7280" }}>
                                            Loading details...
                                        </p>
                                    ) : (
                                        (() => {
                                            const analyses =
                                                getAnalysesForTicket(
                                                    viewTicket,
                                                );
                                            if (
                                                !analyses ||
                                                analyses.length === 0
                                            )
                                                return (
                                                    <p
                                                        style={{
                                                            color: "#6b7280",
                                                        }}>
                                                        No work Details for
                                                        this ticket.
                                                    </p>
                                                );
                                            return (
                                                <div
                                                    style={{
                                                        display: "grid",
                                                        gap: "10px",
                                                    }}>
                                                    {analyses.map((an) => (
                                                        <div
                                                            key={
                                                                an._id ||
                                                                an.analysis_id
                                                            }
                                                            style={{
                                                                padding: "10px",
                                                                border: "1px solid #e5e7eb",
                                                                borderRadius:
                                                                    "8px",
                                                                background:
                                                                    "white",
                                                                display: "flex",
                                                                gap: "12px",
                                                                alignItems:
                                                                    "flex-start",
                                                            }}>
                                                            <div
                                                                style={{
                                                                    flex: 1,
                                                                }}>
                                                                <div
                                                                    style={{
                                                                        display:
                                                                            "flex",
                                                                        justifyContent:
                                                                            "space-between",
                                                                        alignItems:
                                                                            "center",
                                                                    }}>
                                                                    <div>
                                                                        <strong>
                                                                            {an.analysis_id ||
                                                                                an._id}
                                                                        </strong>
                                                                        {" — "}
                                                                        <span>
                                                                            {an.worker_name 
                                                                                ? decryptTicketId(an.worker_name)
                                                                                : an.worker_id ||
                                                                                  "-"}
                                                                        </span>
                                                                    </div>
                                                                    <div
                                                                        style={{
                                                                            fontSize:
                                                                                "12px",
                                                                            color: "#6b7280",
                                                                        }}>
                                                                        {an.created_at
                                                                            ? new Date(
                                                                                  an.created_at,
                                                                              ).toLocaleString()
                                                                            : an.createdAt
                                                                              ? new Date(
                                                                                    an.createdAt,
                                                                                ).toLocaleString()
                                                                              : ""}
                                                                    </div>
                                                                </div>
                                                                <div
                                                                    style={{
                                                                        marginTop: 6,
                                                                        fontSize: 13,
                                                                        color: "#374151",
                                                                    }}>
                                                                    Material
                                                                    Required:{" "}
                                                                    {an.material_required ||
                                                                        "No"}
                                                                </div>
                                                                {an.material_description && (
                                                                    <div
                                                                        style={{
                                                                            marginTop: 6,
                                                                            fontSize: 13,
                                                                            color: "#374151",
                                                                        }}>
                                                                        {
                                                                            an.material_description
                                                                        }
                                                                    </div>
                                                                )}
                                                                <div
                                                                    style={{
                                                                        marginTop: 8,
                                                                        display:
                                                                            "flex",
                                                                        gap: 8,
                                                                        alignItems:
                                                                            "center",
                                                                        flexWrap:
                                                                            "wrap",
                                                                    }}>
                                                                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                                                        <strong style={{ fontSize: 12 }}>Material:</strong>
                                                                        <button
                                                                            onClick={() => handleMaterialToggle(an, true)}
                                                                            style={{
                                                                                padding: "6px 8px",
                                                                                borderRadius: 6,
                                                                                border: an.material_required === "Yes" ? "1px solid #f59e0b" : "1px solid #e5e7eb",
                                                                                background: an.material_required === "Yes" ? "#fffbeb" : "white",
                                                                                color: an.material_required === "Yes" ? "#92400e" : "#475569",
                                                                                cursor: "pointer",
                                                                                fontSize: 12,
                                                                                fontWeight: 600,
                                                                            }}>
                                                                            Pending
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleMaterialToggle(an, false)}
                                                                            style={{
                                                                                padding: "6px 8px",
                                                                                borderRadius: 6,
                                                                                border: an.material_required === "No" ? "1px solid #10b981" : "1px solid #e5e7eb",
                                                                                background: an.material_required === "No" ? "#ecfdf5" : "white",
                                                                                color: an.material_required === "No" ? "#065f46" : "#475569",
                                                                                cursor: "pointer",
                                                                                fontSize: 12,
                                                                                fontWeight: 600,
                                                                            }}>
                                                                            Approved
                                                                        </button>
                                                                    </div>
                                                                    {an.approved_by && (
                                                                        <div
                                                                            style={{
                                                                                fontSize: 11,
                                                                                color: "#6b7280",
                                                                            }}>
                                                                            <strong>
                                                                                Approved
                                                                                By:
                                                                            </strong>{" "}
                                                                            {an.approved_by.name || an.approved_by}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div
                                                                style={{
                                                                    width: 140,
                                                                    textAlign:
                                                                        "right",
                                                                }}>
                                                                {an.uploaded_images &&
                                                                an
                                                                    .uploaded_images
                                                                    .length >
                                                                    0 ? (
                                                                    <div
                                                                        style={{
                                                                            display:
                                                                                "flex",
                                                                            gap: 6,
                                                                            justifyContent:
                                                                                "flex-end",
                                                                            flexWrap:
                                                                                "wrap",
                                                                        }}>
                                                                        {an.uploaded_images
                                                                            .slice(
                                                                                0,
                                                                                3,
                                                                            )
                                                                            .map(
                                                                                (
                                                                                    img,
                                                                                    idx,
                                                                                ) => {
                                                                                    const normalized =
                                                                                        img &&
                                                                                        typeof img ===
                                                                                            "string"
                                                                                            ? img.replace(
                                                                                                  /\\/g,
                                                                                                  "/",
                                                                                              )
                                                                                            : img;
                                                                                    const src =
                                                                                        normalized &&
                                                                                        normalized.startsWith(
                                                                                            "http",
                                                                                        )
                                                                                            ? normalized
                                                                                            : `${API_ENDPOINTS.BASE_URL}/${normalized}`;
                                                                                    return (
                                                                                        <img
                                                                                            key={
                                                                                                idx
                                                                                            }
                                                                                            src={
                                                                                                src
                                                                                            }
                                                                                            alt={`wa-${idx}`}
                                                                                            style={{
                                                                                                width: 48,
                                                                                                height: 48,
                                                                                                objectFit:
                                                                                                    "cover",
                                                                                                borderRadius: 6,
                                                                                                border: "1px solid #e5e7eb",
                                                                                            }}
                                                                                        />
                                                                                    );
                                                                                },
                                                                            )}
                                                                    </div>
                                                                ) : (
                                                                    <div
                                                                        style={{
                                                                            color: "#9ca3af",
                                                                            fontSize: 12,
                                                                        }}>
                                                                        No
                                                                        images
                                                                    </div>
                                                                )}

                                                                <div
                                                                    style={{
                                                                        marginTop: 8,
                                                                    }}>
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedAnalysis({
                                                                                ...an,
                                                                                _viewImagesOnly: true
                                                                            });
                                                                        }}
                                                                        style={{
                                                                            padding:
                                                                                "6px 8px",
                                                                            borderRadius: 6,
                                                                            border: "1px solid #3b82f6",
                                                                            background:
                                                                                "#eff6ff",
                                                                            color: "#1e40af",
                                                                            cursor: "pointer",
                                                                            fontSize: 12,
                                                                            fontWeight: 600,
                                                                        }}>
                                                                        View Images
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })()
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Analysis Detail Modal --- */}
            {selectedAnalysis && (
                <div
                    style={styles.modalOverlay}
                    onClick={() => setSelectedAnalysis(null)}>
                    <div
                        style={{
                            ...styles.largeModal,
                            maxWidth: selectedAnalysis._viewImagesOnly ? "90%" : "600px",
                        }}
                        onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>
                                {selectedAnalysis._viewImagesOnly
                                    ? "Analysis Images"
                                    : `Analysis Details - ${selectedAnalysis.analysis_id || selectedAnalysis._id}`}
                            </h3>
                            <button
                                onClick={() => setSelectedAnalysis(null)}
                                style={styles.iconBtn}>
                                <CloseIcon />
                            </button>
                        </div>
                        <div style={styles.modalBody}>
                            {selectedAnalysis._viewImagesOnly ? (
                                // Images Only View - 50% width grid
                                <div>
                                    {selectedAnalysis.uploaded_images &&
                                    selectedAnalysis.uploaded_images.length >
                                        0 ? (
                                        <div
                                            style={{
                                                display: "grid",
                                                gridTemplateColumns:
                                                    "repeat(auto-fit, minmax(50%, 1fr))",
                                                gap: 16,
                                            }}>
                                            {selectedAnalysis.uploaded_images.map(
                                                (img, i) => {
                                                    return (
                                                        <div
                                                            key={i}
                                                            style={{
                                                                display:
                                                                    "flex",
                                                                flexDirection:
                                                                    "column",
                                                                alignItems:
                                                                    "center",
                                                            }}>
                                                            <img
                                                                src={normalizeImageUrl(img)}
                                                                alt={`image-${i}`}
                                                                style={{
                                                                    width: "100%",
                                                                    height: "auto",
                                                                    maxHeight:
                                                                        "500px",
                                                                    objectFit:
                                                                        "contain",
                                                                    borderRadius: 8,
                                                                    border: "1px solid #e5e7eb",
                                                                    cursor: "pointer",
                                                                }}
                                                                onClick={(
                                                                    e,
                                                                ) => {
                                                                    e.stopPropagation();
                                                                }}
                                                            />
                                                            <span
                                                                style={{
                                                                    marginTop: 8,
                                                                    fontSize:
                                                                        "12px",
                                                                    color: "#6b7280",
                                                                }}>
                                                                Image {i + 1}
                                                            </span>
                                                        </div>
                                                    );
                                                },
                                            )}
                                        </div>
                                    ) : (
                                        <div
                                            style={{
                                                textAlign: "center",
                                                padding: "40px",
                                                color: "#9ca3af",
                                            }}>
                                            📷 No images uploaded
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // Original full details view
                                <div
                                    style={{
                                        display: "grid",
                                        gap: 12,
                                    }}>
                                    <div>
                                        <strong>Ticket:</strong>{" "}
                                        {selectedAnalysis.ticket_id?.title ||
                                            selectedAnalysis.ticket_title ||
                                            "-"}
                                    </div>
                                    <div>
                                        <strong>Worker:</strong>{" "}
                                        {selectedAnalysis.worker_name
                                            ? decryptTicketId(
                                                  selectedAnalysis.worker_name,
                                              )
                                            : selectedAnalysis.worker_id ||
                                              "-"}
                                    </div>
                                    <div>
                                        <strong>Material Required:</strong>{" "}
                                        {selectedAnalysis.material_required}
                                    </div>
                                    {selectedAnalysis.material_description && (
                                        <div>
                                            <strong>Description:</strong>
                                            <div
                                                style={{
                                                    marginTop: 6,
                                                }}>
                                                {
                                                    selectedAnalysis.material_description
                                                }
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <strong>Status:</strong>{" "}
                                        {selectedAnalysis.approval_status}
                                    </div>
                                    {selectedAnalysis.approved_by && (
                                        <div>
                                            <strong>Approved By:</strong>{" "}
                                            {selectedAnalysis.approved_by.name ||
                                                selectedAnalysis.approved_by}
                                        </div>
                                    )}

                                    {selectedAnalysis.uploaded_images &&
                                        selectedAnalysis.uploaded_images
                                            .length > 0 && (
                                            <div>
                                                <strong>Images</strong>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        gap: 8,
                                                        marginTop: 8,
                                                        flexWrap: "wrap",
                                                    }}>
                                                    {selectedAnalysis.uploaded_images.map(
                                                        (img, i) => {
                                                            return (
                                                                <img
                                                                    key={i}
                                                                    src={normalizeImageUrl(img)}
                                                                    alt={`wa-img-${i}`}
                                                                    style={{
                                                                        width: 140,
                                                                        height: 100,
                                                                        objectFit:
                                                                            "cover",
                                                                        borderRadius: 8,
                                                                        border: "1px solid #e5e7eb",
                                                                    }}
                                                                />
                                                            );
                                                        },
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* --- Approval Modal --- */}
            {showApprovalModal && selectedTicketForApproval && (
                <div
                    style={styles.modalOverlay}
                    onClick={() => {
                        setShowApprovalModal(false);
                        setSelectedTicketForApproval(null);
                    }}>
                    <div
                        style={styles.largeModal}
                        onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>
                                Ticket Approval -{" "}
                                {selectedTicketForApproval.ticket_number}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowApprovalModal(false);
                                    setSelectedTicketForApproval(null);
                                }}
                                style={styles.iconBtn}>
                                <CloseIcon />
                            </button>
                        </div>
                        <div style={styles.modalBody}>
                            <ApprovalModule
                                ticketId={selectedTicketForApproval._id}
                                ticketTitle={selectedTicketForApproval.title}
                                onApprovalSuccess={() => {
                                    setShowApprovalModal(false);
                                    setSelectedTicketForApproval(null);
                                    fetchTickets();
                                    showToast(
                                        "Approval submitted successfully!",
                                        "success",
                                    );
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* --- Work Analysis Modal --- */}
            {showWorkAnalysisModal && selectedTicketForAnalysis && (
                <div
                    style={styles.modalOverlay}
                    onClick={() => {
                        setShowWorkAnalysisModal(false);
                        setSelectedTicketForAnalysis(null);
                    }}>
                    <div
                        style={styles.largeModal}
                        onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>
                                Work Details - {selectedTicketForAnalysis.ticket_id}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowWorkAnalysisModal(false);
                                    setSelectedTicketForAnalysis(null);
                                }}
                                style={styles.iconBtn}>
                                <CloseIcon />
                            </button>
                        </div>
                        <div style={styles.modalBody}>
                            <WorkAnalysisForm
                                ticketId={selectedTicketForAnalysis._id}
                                ticketTitle={selectedTicketForAnalysis.title}
                                onAnalysisCreated={() => {
                                    console.log("✅ Work Analysis Created - Updating Ticket Status");
                                    
                                    // Close modal first
                                    setShowWorkAnalysisModal(false);
                                    setSelectedTicketForAnalysis(null);
                                    
                                    // Show success toast immediately
                                    showToast(
                                        "Work Analysis submitted! Status updating...",
                                        "success",
                                    );
                                    
                                    // Refresh data with a delay to ensure backend has updated
                                    setTimeout(async () => {
                                        console.log("🔄 Refreshing tickets list...");
                                        try {
                                            await fetchTickets();
                                            console.log("✅ Tickets refreshed");
                                        } catch (err) {
                                            console.error("❌ Error refreshing tickets:", err);
                                        }
                                        
                                        try {
                                            await fetchWorkAnalyses();
                                            console.log("✅ Work details refreshed");
                                        } catch (err) {
                                            console.error("❌ Error refreshing analyses:", err);
                                        }
                                        
                                        // Also refresh the viewTicket if it's open
                                        if (viewTicket) {
                                            console.log("🔄 Refreshing detail view...");
                                            // Re-fetch fresh ticket data
                                            try {
                                                const updatedData = await getTickets(false);
                                                const updatedTickets = Array.isArray(updatedData) ? updatedData : updatedData.data || [];
                                                const freshTicket = updatedTickets.find(t => String(t._id) === String(viewTicket._id));
                                                if (freshTicket) {
                                                    console.log("✅ Detail view updated with new status:", freshTicket.status);
                                                    setViewTicket(freshTicket);
                                                }
                                            } catch (err) {
                                                console.error("❌ Error refreshing view ticket:", err);
                                            }
                                        }
                                    }, 500);
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* --- Main Page Content --- */}
            <div style={styles.headerSection}>
                <div>
                    <h2 style={styles.mainTitle}>Ticket Management</h2>
                    <p style={styles.subtitle}>
                        Manage and track support tickets
                        {statusFilter && (
                            <span style={{
                                display: 'inline-block',
                                marginLeft: '16px',
                                padding: '6px 12px',
                                background: '#dbeafe',
                                color: '#1e40af',
                                borderRadius: '20px',
                                fontSize: '13px',
                                fontWeight: '600'
                            }}>
                                Filtered: {statusFilter}
                            </span>
                        )}
                    </p>
                </div>
                <div style={styles.searchBarWrapper}>
                    <div style={styles.searchInputWrapper}>
                    <span style={styles.searchIcon}>
                        <SearchIcon />
                    </span>
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={styles.searchInput}
                    />
                    </div>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <button
                        onClick={() => {
                            setEditTicket(null);
                            setShowCreateForm(true);
                        }}
                        style={styles.primaryBtn}>
                        + Create Ticket
                    </button>
                   
                </div>
            </div>

            

            <div style={styles.cardContainer}>
                {filteredTickets.length === 0 ? (
                    <div style={styles.emptyState}>
                        <div style={styles.emptyStateIcon}>📋</div>
                        <h3 style={styles.emptyStateTitle}>No tickets found</h3>
                        <p style={styles.emptyStateText}>
                            {searchTerm
                                ? "Try adjusting your search terms"
                                : "Create your first ticket to get started"}
                        </p>
                        {!searchTerm && (
                            <button
                                onClick={() => {
                                    setEditTicket(null);
                                    setShowCreateForm(true);
                                }}
                                style={styles.emptyStateBtn}>
                                Create New Ticket
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="desktop-view-container">
                            <div style={styles.tableContainer}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            {[
                                                "ID",
                                                "Title",
                                                "Description",
                                                "Img",
                                                "Location",
                                                "Dept",
                                                "Company",
                                                "Raised By",
                                                "Priority",
                                                "Status",
                                                "Approval Status",
                                                "Assigned To",
                                                "Created",
                                                "Closed",
                                                "Actions",
                                            ].map((h, i) => (
                                                <th key={i} style={styles.th}>
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTickets.map((ticket) => (
                                            <tr
                                                key={ticket._id}
                                                style={styles.tr}>
                                                <td style={styles.td}>
                                                    <span style={styles.mono}>
                                                        {ticket.ticket_id}
                                                    </span>
                                                </td>
                                                <td style={styles.td}>
                                                    <span
                                                        style={{
                                                            maxWidth: "150px",
                                                            overflow: "hidden",
                                                            textOverflow: "ellipsis",
                                                            whiteSpace: "nowrap",
                                                            display: "inline-block",
                                                        }}
                                                        title={ticket.title}>
                                                        {ticket.title}
                                                    </span>
                                                </td>
                                                <td style={styles.td}>
                                                    <span
                                                        style={{
                                                            maxWidth: "50px",
                                                            overflow: "hidden",
                                                            textOverflow: "ellipsis",
                                                            whiteSpace: "nowrap",
                                                            display: "inline-block",
                                                            cursor: "pointer",
                                                        }}
                                                        title={
                                                            ticket.description
                                                        }>
                                                        {ticket.description}
                                                    </span>
                                                </td>
                                                <td style={styles.td}>
                                                    {ticket.image ? (
                                                        <img
                                                            src={normalizeImageUrl(ticket.image)}
                                                            alt="img"
                                                            style={styles.thumb}
                                                            onClick={() =>
                                                                setViewTicket(
                                                                    ticket,
                                                                )
                                                            }
                                                        />
                                                    ) : (
                                                        <span
                                                            style={
                                                                styles.noData
                                                            }>
                                                            -
                                                        </span>
                                                    )}
                                                </td>
                                                <td style={styles.td}>
                                                    <span
                                                        title={
                                                            ticket.location
                                                        }
                                                        style={{
                                                            maxWidth:
                                                                "120px",
                                                            overflow:
                                                                "hidden",
                                                            textOverflow:
                                                                "ellipsis",
                                                            whiteSpace:
                                                                "nowrap",
                                                            display:
                                                                "block",
                                                        }}>
                                                        {ticket.location ||
                                                            "-"}
                                                    </span>
                                                </td>
                                                <td style={styles.td}>
                                                    {ticket.department_id
                                                        ?.name || "-"}
                                                </td>
                                                <td style={styles.td}>
                                                    <span
                                                        style={{
                                                            maxWidth: "100px",
                                                            overflow: "hidden",
                                                            textOverflow: "ellipsis",
                                                            whiteSpace: "nowrap",
                                                            display: "inline-block",
                                                        }}
                                                        title={getCompanyName(ticket)}>
                                                        {getCompanyName(ticket)}
                                                    </span>
                                                </td>
                                                <td style={styles.td}>
                                                    {ticket.raised_by?.name ||
                                                        "-"}
                                                </td>
                                                <td style={styles.td}>
                                                    <span
                                                        style={{
                                                            ...styles.badge,
                                                            ...getPriorityStyle(
                                                                getPriorityName(
                                                                    ticket,
                                                                ),
                                                            ),
                                                        }}>
                                                        {getPriorityName(
                                                            ticket,
                                                        )}
                                                    </span>
                                                </td>
                                                <td style={styles.td}>
                                                    <span
                                                        style={{
                                                            ...styles.badge,
                                                            ...getStatusStyle(
                                                                getStatusName(
                                                                    ticket,
                                                                ),
                                                            ),
                                                        }}>
                                                        {getStatusName(ticket)}
                                                    </span>
                                                </td>
                                                <td style={styles.td}>
                                                    {ticket.approval_status ? (
                                                        <span
                                                            style={{
                                                                ...styles.badge,
                                                                background:
                                                                    ticket.approval_status ===
                                                                    "Approved"
                                                                        ? "#dcfce7"
                                                                        : "#fee2e2",
                                                                color:
                                                                    ticket.approval_status ===
                                                                    "Approved"
                                                                        ? "#166534"
                                                                        : "#991b1b",
                                                            }}>
                                                            {
                                                                ticket.approval_status
                                                            }
                                                        </span>
                                                    ) : (
                                                        <span
                                                            style={
                                                                styles.badge
                                                            }>
                                                            Pending
                                                        </span>
                                                    )}
                                                </td>
                                                <td style={styles.td}>
                                                    {ticket.assigned_to &&
                                                    ticket.assigned_to.length >
                                                        0 ? (
                                                        <div
                                                            style={{
                                                                fontSize:
                                                                    "12px",
                                                            }}>
                                                            {ticket.assigned_to
                                                                .slice(0, 2)
                                                                .map(
                                                                    (
                                                                        user,
                                                                        idx,
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                idx
                                                                            }
                                                                            title={
                                                                                user.name
                                                                            }
                                                                            style={{
                                                                                whiteSpace:
                                                                                    "nowrap",
                                                                                overflow:
                                                                                    "hidden",
                                                                                textOverflow:
                                                                                    "ellipsis",
                                                                            }}>
                                                                            {user.name ||
                                                                                "Unknown"}
                                                                        </div>
                                                                    ),
                                                                )}
                                                            {ticket.assigned_to
                                                                .length > 2 && (
                                                                <div
                                                                    style={{
                                                                        color: "#666",
                                                                        fontSize:
                                                                            "11px",
                                                                    }}>
                                                                    +
                                                                    {ticket
                                                                        .assigned_to
                                                                        .length -
                                                                        2}{" "}
                                                                    more
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span
                                                            style={{
                                                                color: "#999",
                                                            }}>
                                                            -
                                                        </span>
                                                    )}
                                                </td>
                                                <td style={styles.td}>
                                                    {new Date(
                                                        ticket.createdAt,
                                                    ).toLocaleString()}
                                                </td>
                                                <td style={styles.td}>
                                                    {ticket.status_id?.name !== "Closed" && ticket.closed_at
                                                        ? new Date(
                                                              ticket.closed_at,
                                                          ).toLocaleString()
                                                        : "-"}
                                                </td>
                                                <td style={styles.td}>
                                                    <div style={styles.actions}>
                                                        <button
                                                            onClick={() =>
                                                                setViewTicket(
                                                                    ticket,
                                                                )
                                                            }
                                                            title="View"
                                                            style={
                                                                styles.iconButton
                                                            }>
                                                            <svg
                                                                width="16"
                                                                height="16"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2">
                                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                                <circle
                                                                    cx="12"
                                                                    cy="12"
                                                                    r="3"
                                                                />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setEditTicket(
                                                                    ticket,
                                                                );
                                                                setShowCreateForm(
                                                                    true,
                                                                );
                                                            }}
                                                            title="Edit"
                                                            style={
                                                                styles.iconButton
                                                            }>
                                                            <svg
                                                                width="16"
                                                                height="16"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2">
                                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedTicketForApproval(
                                                                    ticket,
                                                                );
                                                                setShowApprovalModal(
                                                                    true,
                                                                );
                                                            }}
                                                            title="Approve"
                                                            style={{
                                                                ...styles.iconButton,
                                                                color: "#10b981",
                                                            }}>
                                                            <svg
                                                                width="16"
                                                                height="16"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2">
                                                                <path d="M3 3h18v18H3z" />
                                                                <path d="M9 12l2 2 4-4" />
                                                            </svg>
                                                        </button>
                                                       
                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    ticket,
                                                                )
                                                            }
                                                            title="Delete"
                                                            style={{
                                                                ...styles.iconButton,
                                                                color: "#ef4444",
                                                            }}>
                                                            <TrashIcon />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile/Tablet Card View */}
                        <div className="mobile-view-container">
                            <div className="mobile-card-grid">
                                {filteredTickets.map((ticket) => (
                                    <div
                                        key={ticket._id}
                                        style={styles.cardItem}>
                                        {/* Header: ID, Status, Priority */}
                                        <div style={styles.cardHeader}>
                                            <span style={styles.cardId}>
                                                #{ticket.ticket_id}
                                            </span>
                                            <div style={styles.headerBadges}>
                                                <span
                                                    style={{
                                                        ...styles.badge,
                                                        ...getPriorityStyle(
                                                            getPriorityName(
                                                                ticket,
                                                            ),
                                                        ),
                                                        fontSize: "10px",
                                                        padding: "2px 6px",
                                                    }}>
                                                    {getPriorityName(ticket)}
                                                </span>
                                                <span
                                                    style={{
                                                        ...styles.badge,
                                                        ...getStatusStyle(
                                                            getStatusName(
                                                                ticket,
                                                            ),
                                                        ),
                                                        fontSize: "10px",
                                                        padding: "2px 6px",
                                                    }}>
                                                    {getStatusName(ticket)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Title */}
                                        <div style={styles.cardTitleBlock}>
                                            <h3>{ticket.title}</h3>
                                        </div>

                                        {/* Image Attachment */}
                                        {ticket.image && (
                                            <div style={styles.cardImageBlock}>
                                                <img
                                                    src={normalizeImageUrl(ticket.image)}
                                                    alt="Attachment"
                                                    style={styles.cardImage}
                                                />
                                            </div>
                                        )}

                                        {/* Data Rows (Card Body) */}
                                        <div style={styles.cardDataBody}>
                                            {/* Row 1: Company | Dept */}
                                            <div style={styles.dataRow}>
                                                <div style={styles.dataCol}>
                                                    <span style={styles.label}>
                                                        <BuildingIcon /> Company
                                                    </span>
                                                    <span style={styles.value}>
                                                        {getCompanyName(ticket)}
                                                    </span>
                                                </div>
                                                <div style={styles.dataCol}>
                                                    <span style={styles.label}>
                                                        Dept
                                                    </span>
                                                    <span style={styles.value}>
                                                        {ticket.department_id
                                                            ?.name || "-"}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Row 1.5: Location */}
                                            <div style={styles.dataRow}>
                                                <div style={styles.dataColFull}>
                                                    <span style={styles.label}>
                                                        📍 Location
                                                    </span>
                                                    <span style={styles.value}>
                                                        {ticket.location ||
                                                            "-"}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Row 2: Raised By | Approval */}
                                            <div style={styles.dataRow}>
                                                <div style={styles.dataCol}>
                                                    <span style={styles.label}>
                                                        <UserIcon /> Raised
                                                    </span>
                                                    <span style={styles.value}>
                                                        {ticket.raised_by
                                                            ?.name || "-"}
                                                    </span>
                                                </div>
                                                <div style={styles.dataCol}>
                                                    <span style={styles.label}>
                                                        Approval
                                                    </span>
                                                    <span
                                                        style={{
                                                            ...styles.value,
                                                            ...styles.approvalText(
                                                                ticket.approval_status,
                                                            ),
                                                        }}>
                                                        {ticket.approval_status ||
                                                            "Pending"}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Row 3: Assigned To | Created */}
                                            <div style={styles.dataRow}>
                                                <div style={styles.dataCol}>
                                                    <span style={styles.label}>
                                                        Assigned
                                                    </span>
                                                    <span style={styles.value}>
                                                        {ticket.assigned_to &&
                                                        ticket.assigned_to
                                                            .length > 0
                                                            ? ticket
                                                                  .assigned_to[0]
                                                                  .name +
                                                              (ticket
                                                                  .assigned_to
                                                                  .length > 1
                                                                  ? ` +${ticket.assigned_to.length - 1}`
                                                                  : "")
                                                            : "-"}
                                                    </span>
                                                </div>
                                                <div style={styles.dataCol}>
                                                    <span style={styles.label}>
                                                        <CalendarIcon /> Created
                                                    </span>
                                                    <span style={styles.value}>
                                                        {new Date(
                                                            ticket.createdAt,
                                                        ).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Description Block */}
                                            <div style={styles.descRow}>
                                                <span style={styles.label}>
                                                    Description
                                                </span>
                                                <p style={styles.descText}>
                                                    {ticket.description}
                                                </p>
                                            </div>

                                            {/* Closed Date (if applicable) */}
                                            {ticket.closed_at && (
                                                <div style={styles.dataRow}>
                                                    <div
                                                        style={
                                                            styles.dataColFull
                                                        }>
                                                        <span
                                                            style={
                                                                styles.label
                                                            }>
                                                            <CalendarIcon />{" "}
                                                            Closed On
                                                        </span>
                                                        <span
                                                            style={
                                                                styles.value
                                                            }>
                                                            {new Date(
                                                                ticket.closed_at,
                                                            ).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Footer */}
                                        <div style={styles.cardActions}>
                                            <button
                                                onClick={() =>
                                                    setViewTicket(ticket)
                                                }
                                                style={styles.actionBtn}>
                                                View
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditTicket(ticket);
                                                    setShowCreateForm(true);
                                                }}
                                                style={styles.actionBtn}>
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedTicketForApproval(
                                                        ticket,
                                                    );
                                                    setShowApprovalModal(true);
                                                }}
                                                style={{
                                                    ...styles.actionBtn,
                                                    ...styles.approveBtnStyle,
                                                }}>
                                                Approve
                                            </button>
                                        
                                            <button
                                                onClick={() =>
                                                    handleDelete(ticket)
                                                }
                                                style={{
                                                    ...styles.actionBtn,
                                                    ...styles.deleteBtnStyle,
                                                }}>
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

// --- Helper Styles Functions ---
const getPriorityStyle = (name) => {
    const n = String(name).toLowerCase();
    if (n.includes("critical"))
        return { background: "#fee2e2", color: "#991b1b" };
    if (n.includes("high")) return { background: "#ffedd5", color: "#9a3412" };
    if (n.includes("low")) return { background: "#d1fae5", color: "#065f46" };
    return { background: "#fef3c7", color: "#92400e" };
};

const getStatusStyle = (name) => {
    const n = String(name).toLowerCase();
    if (n.includes("closed"))
        return {
            background: "#f3f4f6",
            color: "#4b5563",
            textDecoration: "line-through",
        };
    if (n.includes("material request"))
        return { background: "#fef3c7", color: "#92400e" };
    if (n.includes("material approved"))
        return { background: "#dcfce7", color: "#166534" };
    if (n.includes("progress"))
        return { background: "#e0e7ff", color: "#3730a3" };
    if (n.includes("resolved"))
        return { background: "#dcfce7", color: "#166534" };
    return { background: "#dbeafe", color: "#1e40af" };
};

// --- CSS Styles Object ---
const styles = {
    pageContainer: {
        fontFamily:
            "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
        backgroundColor: "#e2e5ea",
        minHeight: "100vh",
        padding: "20px",
        color: "#111827",
       
    },
    headerSection: {
       display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
    justifyContent: "flex-start",
    marginBottom: "24px",
    },
    mainTitle: {
        margin: 0,
        fontSize: "28px",
        fontWeight: "700",
        color: "#111827",
    },
    subtitle: {
        margin: "5px 0 0 0",
        color: "#6b7280",
        fontSize: "14px",
    },
    primaryBtn: {
        background: "#4f46e5",
        color: "white",
        border: "none",
        padding: "10px 20px",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        boxShadow: "0 4px 6px -1px rgba(79, 70, 229, 0.2)",
        transition: "all 0.2s",
    },

    searchInputWrapper: {
        position: "relative",
        maxWidth: "400px",
    },
    searchIcon: {
        position: "absolute",
        left: "12px",
        top: "12px",
        color: "#9ca3af",
    },
    searchInput: {
        width: "100%",
        padding: "10px 10px 10px 40px",
        borderRadius: "8px",
        border: "1px solid #d1d5db",
        outline: "none",
        fontSize: "14px",
        boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        transition: "all 0.2s",
    },

    cardContainer: {
        background: "transparent",
        borderRadius: "0",
        boxShadow: "none",
        overflow: "visible",
    },

    // --- CARD BASED DESIGN (Mobile/Tablet) Styles ---
    cardItem: {
        background: "#ffffff",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.2s, box-shadow 0.2s",
    },

    // Header Section
    cardHeader: {
        padding: "12px 16px",
        borderBottom: "1px solid #f3f4f6",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#fafafa",
    },
    cardId: {
        fontFamily: "monospace",
        fontSize: "13px",
        fontWeight: 700,
        color: "#4b5563",
    },
    headerBadges: {
        display: "flex",
        gap: "4px",
    },
    badge: {
        borderRadius: "9999px",
        fontWeight: 600,
        textTransform: "uppercase",
        padding: "2px 8px",
        fontSize: "11px",
    },

    // Title Block
    cardTitleBlock: {
        padding: "16px 16px 8px 16px",
    },
    "cardTitleBlock h3": {
        margin: 0,
        fontSize: "16px",
        fontWeight: "700",
        color: "#111827",
        lineHeight: "1.4",
    },

    // Image Block
    cardImageBlock: {
        width: "50%",
        height: "200px",
        backgroundColor: "#f9fafb",
        borderBottom: "1px solid #f3f4f6",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
    },
    cardImage: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        cursor: "pointer",
    },

    // Data Body (The Card Fields)
    cardDataBody: {
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        backgroundColor: "#ffffff",
    },
    dataRow: {
        display: "flex",
        justifyContent: "space-between",
        gap: "16px",
        paddingBottom: "12px",
        borderBottom: "1px dashed #f3f4f6",
    },
    dataCol: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: "2px",
    },
    dataColFull: {
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "2px",
    },
    label: {
        fontSize: "11px",
        textTransform: "uppercase",
        color: "#9ca3af",
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        gap: "4px",
    },
    value: {
        fontSize: "13px",
        color: "#374151",
        fontWeight: 500,
        wordBreak: "break-word",
    },
    approvalText: (status) => ({
        color:
            status === "Approved"
                ? "#059669"
                : status === "Rejected"
                  ? "#dc2626"
                  : "#d97706",
    }),

    // Description
    descRow: {
        marginTop: "4px",
        paddingBottom: "12px",
        borderBottom: "1px dashed #f3f4f6",
    },
    descText: {
        margin: 0,
        fontSize: "13px",
        color: "#4b5563",
        lineHeight: "1.5",
    },

    // Footer Actions
    cardActions: {
        padding: "12px 16px",
        backgroundColor: "#f9fafb",
        borderTop: "1px solid #e5e7eb",
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "8px",
    },
    actionBtn: {
        padding: "8px",
        borderRadius: "6px",
        border: "1px solid #bf3014",
        background: "white",
        color: "#4b5563",
        fontSize: "12px",
        fontWeight: 500,
        cursor: "pointer",
        transition: "all 0.2s",
    },
    approveBtnStyle: {
        borderColor: "#a1bc1d",
        color: "#059669",
        backgroundColor: "#ecfdf5",
    },
   
    deleteBtnStyle: {
        borderColor: "#fecaca",
        color: "#dc2626",
        backgroundColor: "#fef2f2",
    },

    // Desktop Styles (Table)
    tableContainer: {
        overflowX: "auto",
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    },
    table: { width: "100%", borderCollapse: "collapse", minWidth: "1200px" },
    th: {
        textAlign: "left",
        padding: "16px",
        background: "#f9fafb",
        color: "#000000",
        fontSize: "12px",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        fontWeight: "700",
        borderBottom: "1px solid #e5e7eb",
    },
    tr: {
        borderBottom: "1px solid #f3f4f6",
        transition: "background-color 0.2s",
    },
    td: {
        padding: "16px",
        fontSize: "14px",
        color: "#374151",
        verticalAlign: "middle",
    },
    thumb: {
        width: "40px",
        height: "40px",
        borderRadius: "6px",
        objectFit: "cover",
        cursor: "pointer",
        border: "1px solid #eee",
    },
    noData: { color: "#d1d5db", fontStyle: "italic" },
    mono: { fontFamily: "monospace", color: "#6b7280" },
    actions: { display: "flex", gap: "8px" },
    iconButton: {
        background: "transparent",
        border: "1px solid #e5e7eb",
        color: "#6b7280",
        width: "32px",
        height: "32px",
        borderRadius: "6px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
    },
    emptyState: {
        padding: "60px 20px",
        textAlign: "center",
        color: "#9ca3af",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "white",
        borderRadius: "12px",
    },
    emptyStateIcon: { fontSize: "48px", marginBottom: "16px" },
    emptyStateTitle: {
        fontSize: "20px",
        fontWeight: "600",
        margin: "0 0 8px 0",
        color: "#4b5563",
    },
    emptyStateText: {
        fontSize: "16px",
        margin: "0 0 24px 0",
        maxWidth: "400px",
    },
    emptyStateBtn: {
        background: "#4f46e5",
        color: "white",
        border: "none",
        padding: "10px 20px",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
    },

    // Modals (Unchanged)
    viewModal: {
        background: "white",
        width: "800px",
        maxWidth: "90%",
        borderRadius: "16px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        display: "flex",
        flexDirection: "column",
        maxHeight: "90vh",
        overflow: "hidden",
    },
    viewModalHeader: {
        padding: "24px",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#f9fafb",
    },
    viewModalTitle: {
        margin: 0,
        fontSize: "20px",
        fontWeight: "700",
        color: "#111827",
    },
    viewModalBody: {
        padding: "0",
        overflowY: "auto",
        backgroundColor: "#f9fafb",
    },
    ticketCard: {
        margin: "24px",
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow:
            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        overflow: "hidden",
    },
    ticketHeader: {
        padding: "20px 24px",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    ticketId: {
        display: "flex",
        flexDirection: "column",
    },
    ticketIdLabel: {
        fontSize: "12px",
        color: "#6b7280",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        fontWeight: "600",
    },
    ticketIdValue: {
        fontSize: "18px",
        fontWeight: "700",
        color: "#111827",
        fontFamily: "monospace",
    },
    ticketStatusContainer: {
        display: "flex",
        gap: "8px",
    },
    
    ticketSection: {
        padding: "20px 24px",
        borderBottom: "1px solid #f3f4f6",
    },
    sectionTitle: {
        margin: "0 0 16px 0",
        fontSize: "16px",
        fontWeight: "600",
        color: "#111827",
    },
   infoGrid: {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "20px",
},

infoItem: {
  display: "flex",
  flexDirection: "column",
  minWidth: 0,   // ⭐ VERY IMPORTANT for grid ellipsis
},

infoValue: {
  width: "100%",     // ⭐ use column width
  margin: 0,
  fontSize: "14px",
  color: "#374151",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
},

    infoLabel: {
        margin: "0 0 6px 0",
        fontSize: "12px",
        color: "#6b7280",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        fontWeight: "600",
        display: "flex",
        alignItems: "center",
        gap: "6px",
    },


    imageContainer: {
        width: "20%",
        marginTop: "12px",
        borderRadius: "8px",
        overflow: "hidden",
        border: "1px solid #e5e7eb",
    },
    detailImage: {
        maxWidth: "100%",
        display: "block",
    },
    
    modalOverlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 9999,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    largeModal: {
        padding:"20px",
        background: "white",
        width: "700px",
        maxWidth: "80%",
        borderRadius: "12px",
        boxShadow:
            "0 20px 25px -5px rgba(255, 15, 15, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        display: "flex",
        flexDirection: "column",
        maxHeight: "90vh",
    },
    modalHeader: {
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    modalTitle: {
        margin: 0,
        fontSize: "18px",
        fontWeight: "600",
        color: "#111827",
    },
    modalBody: { padding: "20px", overflowY: "auto" },
    iconBtn: {
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "#9ca3af",
        padding: "4px",
        borderRadius: "4px",
    },
    confirmModal: {
        background: "white",
        width: "400px",
        borderRadius: "12px",
        padding: "0",
        boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    },
    confirmHeader: { padding: "20px", borderBottom: "1px solid #f3f4f6" },
    confirmTitle: {
        margin: 0,
        fontSize: "18px",
        fontWeight: "600",
        color: "#111827",
    },
    confirmBody: { padding: "20px", fontSize: "15px", color: "#374151" },
    confirmFooter: {
        padding: "15px 20px",
        background: "#f9fafb",
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px",
        borderBottomLeftRadius: "12px",
        borderBottomRightRadius: "12px",
    },
    btnSecondary: {
        padding: "8px 16px",
        borderRadius: "6px",
        border: "1px solid #d1d5db",
        background: "white",
        color: "#374151",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "500",
        transition: "all 0.2s",
    },
    btnPrimary: {
        padding: "8px 16px",
        borderRadius: "6px",
        border: "none",
        background: "#4f46e5",
        color: "white",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "500",
        transition: "all 0.2s",
    },
    toast: {
        position: "fixed",
        top: "20px",
        right: "20px",
        padding: "16px 20px",
        borderRadius: "8px",
        boxShadow:
            "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        minWidth: "300px",
        maxWidth: "500px",
        transform: "translateX(0)",
        transition: "transform 0.3s ease-in-out",
    },
    toastSuccess: { background: "#10b981", color: "white" },
    toastError: { background: "#ef4444", color: "white" },
    toastContent: { display: "flex", alignItems: "center" },
    toastMessage: { marginLeft: "10px" },
    toastClose: {
        background: "none",
        border: "none",
        color: "inherit",
        cursor: "pointer",
        padding: "0",
        marginLeft: "10px",
        opacity: 0.8,
    },
    errorIcon: { fontSize: "18px" },
    spinnerContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "50vh",
    },
    spinner: {
        width: "40px",
        height: "40px",
        border: "4px solid #e5e7eb",
        borderTop: "4px solid #4f46e5",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        marginBottom: "16px",
    },
    loadingText: {
        color: "#6b7280",
        fontSize: "16px",
    },
        // --- Work Analysis Section Styles ---
    analysisSection: {
        padding: "24px 32px",
        backgroundColor: "#f8fafc", // Subtle background for the whole section
        borderTop: "1px solid #e2e8f0",
    },
    sectionHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
    },
    analysisCount: {
        fontSize: "13px",
        fontWeight: "600",
        color: "#64748b",
        background: "#e2e8f0",
        padding: "2px 10px",
        borderRadius: "12px",
    },

    // List & Cards
    analysisList: {
        display: "flex",
        flexDirection: "column",
        gap: "16px",
    },
    analysisCard: {
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "20px",
        display: "flex",
        gap: "24px",
        transition: "all 0.2s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    },
    "analysisCard:hover": {
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        borderColor: "#cbd5e1",
        transform: "translateY(-1px)",
    },

    // Left Column
    analysisLeftCol: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: "12px",
    },
    cardHeaderRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    cardIdBlock: {
        display: "flex",
        alignItems: "baseline",
        gap: "6px",
    },
    idLabel: {
        fontSize: "10px",
        textTransform: "uppercase",
        color: "#94a3b8",
        fontWeight: "700",
        letterSpacing: "0.5px",
    },
    idValue: {
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "13px",
        fontWeight: "600",
        color: "#334155",
        background: "#f1f5f9",
        padding: "2px 6px",
        borderRadius: "4px",
    },
    dateText: {
        fontSize: "12px",
        color: "#64748b",
        fontWeight: "500",
    },
    workerInfo: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "13px",
        color: "#475569",
        fontWeight: "500",
    },
    detailRow: {
        display: "flex",
        gap: "16px",
        flexWrap: "wrap",
    },
    materialBadge: {
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 10px",
        backgroundColor: "#eff6ff",
        color: "#1e40af",
        borderRadius: "6px",
        fontSize: "12px",
        fontWeight: "600",
        border: "1px solid #dbeafe",
    },
    descriptionBlock: {
        backgroundColor: "#f8fafc",
        padding: "12px",
        borderRadius: "8px",
        border: "1px solid #f1f5f9",
    },
    descriptionText: {
        margin: 0,
        fontSize: "13px",
        color: "#475569",
        lineHeight: "1.5",
        fontStyle: "italic",
    },

    // Approval Controls (Modern Toggle)
    approvalControls: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
    },
    approvalLabel: {
        fontSize: "11px",
        textTransform: "uppercase",
        color: "#94a3b8",
        fontWeight: "700",
        letterSpacing: "0.5px",
    },
    toggleGroup: {
        display: "flex",
        background: "#f1f5f9",
        padding: "4px",
        borderRadius: "8px",
        width: "fit-content",
    },
    toggleBtn: {
        padding: "6px 16px",
        borderRadius: "6px",
        border: "none",
        fontSize: "12px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.2s",
    },
    toggleBtnInactive: {
        background: "transparent",
        color: "#64748b",
    },
    toggleBtnActivePending: {
        background: "white",
        color: "#d97706", // Amber
        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
    },
    toggleBtnActiveApproved: {
        background: "white",
        color: "#059669", // Green
        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
    },
    approverInfo: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
    },
    approverLabel: {
        color: "#94a3b8",
        textTransform: "uppercase",
        fontSize: "10px",
        fontWeight: "700",
    },
    approverName: {
        fontSize: "12px",
        color: "#475569",
        fontWeight: "500",
    },

    // Right Column (Media)
    analysisRightCol: {
        width: "160px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        alignItems: "flex-end",
    },
    imageGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "6px",
        width: "100%",
    },
    thumbImg: {
        width: "100%",
        aspectRatio: "1",
        objectFit: "cover",
        borderRadius: "6px",
        border: "1px solid #e2e8f0",
        cursor: "pointer",
        transition: "transform 0.2s",
    },
    "thumbImg:hover": {
        transform: "scale(1.05)",
    },
    moreImagesBadge: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1e293b",
        color: "white",
        fontSize: "11px",
        fontWeight: "700",
        borderRadius: "6px",
        aspectRatio: "1",
    },
    noImages: {
        width: "100%",
        aspectRatio: "1.6",
        border: "1px dashed #cbd5e1",
        borderRadius: "8px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        color: "#94a3b8",
        fontSize: "11px",
    },
    viewDetailsBtn: {
        width: "100%",
        padding: "8px 12px",
        borderRadius: "6px",
        border: "1px solid #cbd5e1",
        background: "white",
        color: "#475569",
        fontSize: "12px",
        fontWeight: "600",
        cursor: "pointer",
        textAlign: "center",
        transition: "all 0.2s",
    },
    "viewDetailsBtn:hover": {
        background: "#f8fafc",
        borderColor: "#94a3b8",
    },

    // Loading & Empty States
    loadingWrapper: {
        padding: "20px",
        textAlign: "center",
    },
    loadingText: {
        color: "#64748b",
        fontStyle: "italic",
        fontSize: "14px",
    },
    emptyAnalysisState: {
        padding: "40px 20px",
        textAlign: "center",
        border: "1px dashed #cbd5e1",
        borderRadius: "12px",
        background: "#f8fafc",
    },
    emptyIcon: { fontSize: "24px", marginBottom: "12px" },
    emptyText: { margin: 0, color: "#94a3b8", fontSize: "14px" },
    
};

const styleSheet = document.createElement("style");

styleSheet.innerText = ` 
@keyframes spin { 
    0% { transform: rotate(0deg); } 
    100% { transform: rotate(360deg); } 
}

/* --- RESPONSIVE LOGIC --- */
/* Hide Desktop Table on Mobile, Show Cards */
@media (max-width: 1024px) {
    .desktop-view-container {
        display: none !important;
    }
    .mobile-view-container {
        display: block !important;
    }
    .mobile-card-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 20px;
    }
}

/* Hide Mobile Cards on Desktop, Show Table */
@media (min-width: 1025px) {
    .desktop-view-container {
        display: block !important;
    }
    .mobile-view-container {
        display: none !important;
    }
}

/* Tablet Card Layout (600px to 1024px) */
@media (min-width: 600px) and (max-width: 1024px) {
    .mobile-card-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

/* --- INTERACTION STYLES --- */
tr:hover {
    background-color: #f9fafb;
}

.iconButton:hover {
    background-color: #f3f4f6;
    color: #4b5563;
}

.thumb:hover {
    transform: scale(1.1);
}

/* Mobile Card Interaction */
.cardItem:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.actionBtn:hover {
    filter: brightness(0.95);
    transform: translateY(-1px);
}

.cardImage:hover {
    opacity: 0.9;
}
`;

document.head.appendChild(styleSheet);

export default TicketList;
