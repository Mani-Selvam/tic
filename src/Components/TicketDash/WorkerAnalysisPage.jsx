import React, { useEffect, useState } from "react";
import {
    getWorkerAssignedTickets,
    getWorkerWorkAnalysis,
} from "@/Components/Api/TicketApi/workerAPI";
import WorkAnalysisForm from "./WorkAnalysisForm";
import API_ENDPOINTS from "@/config/apiConfig";
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

const FileTextIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
);

const BuildingIcon = () => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2">
        <rect x="3" y="2" width="18" height="20" rx="2" ry="2"></rect>
        <line x1="9" y1="2" x2="9" y2="22"></line>
        <line x1="15" y1="2" x2="15" y2="22"></line>
        <line x1="3" y1="7" x2="21" y2="7"></line>
        <line x1="3" y1="12" x2="21" y2="12"></line>
    </svg>
);

const UserIcon = () => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);

const CalendarIcon = () => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
);

const WorkerAnalysisPage = () => {
    // Get user from localStorage
    const userJson = localStorage.getItem("user");
    const user = userJson ? JSON.parse(userJson) : {};
    const workerId = user._id || user.id;

    // State
    const [tickets, setTickets] = useState([]);
    const [workAnalyses, setWorkAnalyses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [viewTicket, setViewTicket] = useState(null);
    const [showWorkAnalysisModal, setShowWorkAnalysisModal] = useState(false);
    const [selectedTicketForAnalysis, setSelectedTicketForAnalysis] = useState(null);
    const [selectedAnalysisToView, setSelectedAnalysisToView] = useState(null);
    const [editingInitialData, setEditingInitialData] = useState(null);
    const [formDataDraft, setFormDataDraft] = useState(null);
    const [toast, setToast] = useState({
        show: false,
        message: "",
        type: "success",
    });

    // --- Helpers ---

    // Check if a ticket already has a work analysis
    const hasSubmittedAnalysis = (ticketId) => {
        return workAnalyses.some((a) => {
            const tId = a.ticket_id;
            return (
                tId === ticketId ||
                (tId && typeof tId === "object" && tId._id === ticketId)
            );
        });
    };

    // Helper to get border color based on priority for the visual indicator
    const getPriorityBorderColor = (name) => {
        const n = String(name).toLowerCase();
        if (n.includes("critical")) return "#ef4444"; // Red 500
        if (n.includes("high")) return "#f97316";    // Orange 500
        if (n.includes("low")) return "#10b981";     // Emerald 500
        return "#f59e0b"; // Amber 500
    };

    const getPriorityStyle = (name) => {
        const n = String(name).toLowerCase();
        if (n.includes("critical"))
            return { background: "#fef2f2", color: "#991b1b", borderColor: "#fecaca" };
        if (n.includes("high")) return { background: "#fff7ed", color: "#9a3412", borderColor: "#fed7aa" };
        if (n.includes("low")) return { background: "#ecfdf5", color: "#065f46", borderColor: "#a7f3d0" };
        return { background: "#fffbeb", color: "#92400e", borderColor: "#fde68a" };
    };

    const getStatusStyle = (name) => {
        const n = String(name).toLowerCase();
        if (n.includes("closed"))
            return {
                background: "#f3f4f6",
                color: "#4b5563",
                borderColor: "#e5e7eb",
            };
        if (n.includes("progress"))
            return { background: "#eef2ff", color: "#4338ca", borderColor: "#c7d2fe" };
        if (n.includes("resolved"))
            return { background: "#f0fdf4", color: "#166534", borderColor: "#bbf7d0" };
        return { background: "#eff6ff", color: "#1e40af", borderColor: "#bfdbfe" };
    };

    // Get analysis for a specific ticket
    const getAnalysisForTicket = (ticketId) => {
        return workAnalyses.find((a) => {
            const tId = a.ticket_id;
            return (
                tId === ticketId ||
                (tId && typeof tId === "object" && tId._id === ticketId)
            );
        });
    };

    // --- Data Fetching ---

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const data = await getWorkerAssignedTickets();
            const ticketArray = Array.isArray(data) ? data : data.data || [];
            setTickets(ticketArray);
        } catch (error) {
            console.error("Error fetching tickets:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchWorkAnalyses = async () => {
        try {
            const data = await getWorkerWorkAnalysis();
            const allAnalyses = Array.isArray(data) ? data : data.data || [];
            
            // Filter to show ONLY records with:
            // 1. Material Required = "Yes"
            // 2. Approval Status = "Approved" (Material Approved)
            const filteredAnalyses = allAnalyses.filter((analysis) => {
                const hasMaterial = String(analysis.material_required).toLowerCase() === "yes";
                const isApproved = String(analysis.approval_status).toLowerCase() === "approved";
                return hasMaterial && isApproved;
            });
            
            setWorkAnalyses(filteredAnalyses);
        } catch (error) {
            console.error("Error fetching work analyses:", error);
        }
    };

    useEffect(() => {
        if (workerId) {
            fetchTickets();
            fetchWorkAnalyses();
        }
    }, [workerId]);

    // Load draft form data when modal opens for a specific ticket
    useEffect(() => {
        if (showWorkAnalysisModal && selectedTicketForAnalysis && !editingInitialData) {
            const draftKey = `work_analysis_draft_${selectedTicketForAnalysis._id}`;
            const savedDraft = localStorage.getItem(draftKey);
            if (savedDraft) {
                try {
                    setFormDataDraft(JSON.parse(savedDraft));
                } catch (e) {
                    console.warn("Failed to restore draft:", e);
                }
            }
        }
    }, [showWorkAnalysisModal, selectedTicketForAnalysis?._id, editingInitialData]);

    // --- Handlers ---

    const showToast = (message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: "", type }), 3000);
    };

    const getPriorityName = (ticket) => {
        return ticket.priority_id?.name || ticket.priority || "Unknown";
    };

    const getStatusName = (ticket) => {
        return ticket.status_id?.name || ticket.status || "Unknown";
    };

    const getCompanyName = (ticket) => {
        return ticket.company_id?.name || ticket.institution_id?.name || "-";
    };

    const filteredTickets = tickets.filter((ticket) => {
        const term = searchTerm.toLowerCase();
        const id = String(ticket.ticket_id || "").toLowerCase();
        const title = String(ticket.title || "").toLowerCase();
        const location = String(ticket.location || "").toLowerCase();
        const desc = String(ticket.description || "").toLowerCase();
        return id.includes(term) || title.includes(term) || location.includes(term) || desc.includes(term);
    });

    if (loading) {
        return (
            <div style={styles.pageContainer}>
                <div style={styles.spinnerContainer}>
                    <div style={styles.spinner}></div>
                    <p style={styles.loadingText}>Loading your assigned tickets...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.pageContainer}>
            {/* Toast Notification */}
            {toast.show && (
                <div
                    style={{
                        ...styles.toast,
                        ...(toast.type === "error"
                            ? styles.toastError
                            : styles.toastSuccess),
                    }}>
                    <div style={styles.toastContent}>
                        {toast.type === "success" ? <CheckIcon /> : <span style={styles.errorIcon}>⚠</span>}
                        <span style={styles.toastMessage}>{toast.message}</span>
                    </div>
                    <button style={styles.toastClose} onClick={() => setToast({ show: false, message: "", type: "" })}>
                        <CloseIcon />
                    </button>
                </div>
            )}

            {/* View Ticket Modal */}
            {viewTicket && (
                <div style={styles.modalOverlay} onClick={() => setViewTicket(null)}>
                    <div style={styles.viewModal} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.viewModalHeader}>
                            <h3 style={styles.viewModalTitle}>Ticket Details</h3>
                            <button onClick={() => setViewTicket(null)} style={styles.iconBtn}>
                                <CloseIcon />
                            </button>
                        </div>
                        <div style={styles.viewModalBody}>
                            <div style={styles.ticketCard}>
                                <div style={styles.ticketHeader}>
                                    <div style={styles.ticketId}>
                                        <span style={styles.ticketIdLabel}>Ticket ID:</span>
                                        <span style={styles.ticketIdValue}>{viewTicket.ticket_id}</span>
                                    </div>
                                    <div style={styles.ticketStatusContainer}>
                                        <span style={{ ...styles.badge, ...getPriorityStyle(getPriorityName(viewTicket)) }}>
                                            {getPriorityName(viewTicket)}
                                        </span>
                                        <span style={{ ...styles.badge, ...getStatusStyle(getStatusName(viewTicket)) }}>
                                            {getStatusName(viewTicket)}
                                        </span>
                                    </div>
                                </div>

                                <div style={styles.ticketSection}>
                                    <h4 style={styles.sectionTitle}>Ticket Information</h4>
                                    <div style={styles.infoGrid}>
                                        <div style={styles.infoItem}>
                                            <h5 style={styles.infoLabel}>Title</h5>
                                            <p style={styles.infoValue}>{viewTicket.title}</p>
                                        </div>
                                        <div style={styles.infoItem}>
                                            <h5 style={styles.infoLabel}>Location</h5>
                                            <p style={styles.infoValue}>{viewTicket.location || "-"}</p>
                                        </div>
                                        <div style={styles.infoItem}>
                                            <h5 style={styles.infoLabel}>Description</h5>
                                            <p style={styles.infoValue}>{viewTicket.description}</p>
                                        </div>
                                        <div style={styles.infoItem}>
                                            <h5 style={styles.infoLabel}><BuildingIcon /> Company</h5>
                                            <p style={styles.infoValue}>{getCompanyName(viewTicket)}</p>
                                        </div>
                                        <div style={styles.infoItem}>
                                            <h5 style={styles.infoLabel}>Department</h5>
                                            <p style={styles.infoValue}>{viewTicket.department_id?.name || "-"}</p>
                                        </div>
                                    </div>
                                </div>

                                <div style={styles.ticketSection}>
                                    <h4 style={styles.sectionTitle}>People & Dates</h4>
                                    <div style={styles.infoGrid}>
                                        <div style={styles.infoItem}>
                                            <h5 style={styles.infoLabel}><UserIcon /> Raised By</h5>
                                            <p style={styles.infoValue}>{viewTicket.raised_by?.name || "-"}</p>
                                        </div>
                                        <div style={styles.infoItem}>
                                            <h5 style={styles.infoLabel}><CalendarIcon /> Created On</h5>
                                            <p style={styles.infoValue}>{new Date(viewTicket.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>

                                {viewTicket.image && (
                                    <div style={styles.ticketSection}>
                                        <h4 style={styles.sectionTitle}>Attachment</h4>
                                        <div style={styles.imageContainer}>
                                            <img src={`${API_ENDPOINTS.BASE_URL}/${viewTicket.image}`} alt="ticket attachment" style={styles.detailImage} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Work Analysis Modal */}
            {showWorkAnalysisModal && selectedTicketForAnalysis && (
                <div style={styles.modalOverlay} onClick={() => { setShowWorkAnalysisModal(false); setSelectedTicketForAnalysis(null); }}>
                    <div style={styles.largeModal} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>Work Analysis - {selectedTicketForAnalysis.ticket_id}</h3>
                            <button onClick={() => { setShowWorkAnalysisModal(false); setSelectedTicketForAnalysis(null); }} style={styles.iconBtn}>
                                <CloseIcon />
                            </button>
                        </div>
                        <div style={styles.modalBody}>
                            <WorkAnalysisForm
                                ticketId={selectedTicketForAnalysis._id}
                                ticketTitle={selectedTicketForAnalysis.title}
                                onSuccess={() => {
                                    // Clear the saved draft after successful submission
                                    const draftKey = `work_analysis_draft_${selectedTicketForAnalysis._id}`;
                                    localStorage.removeItem(draftKey);
                                    
                                    setShowWorkAnalysisModal(false);
                                    setSelectedTicketForAnalysis(null);
                                    setEditingInitialData(null);
                                    setFormDataDraft(null);
                                    fetchTickets();
                                    fetchWorkAnalyses();
                                    showToast("Work Analysis submitted successfully!", "success");
                                }}
                                initialData={editingInitialData}
                                draftData={formDataDraft}
                                onFormChange={(data) => {
                                    // Auto-save form changes to localStorage
                                    const draftKey = `work_analysis_draft_${selectedTicketForAnalysis._id}`;
                                    localStorage.setItem(draftKey, JSON.stringify(data));
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Analysis Details Modal */}
            {selectedAnalysisToView && (
                <div style={styles.modalOverlay} onClick={() => setSelectedAnalysisToView(null)}>
                    <div style={styles.largeModal} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>Analysis Details</h3>
                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                <button
                                    onClick={() => {
                                        // Prepare ticket object and open the work analysis modal with prefilled data
                                        const ticketObj = selectedAnalysisToView.ticket_id && typeof selectedAnalysisToView.ticket_id === "object"
                                            ? selectedAnalysisToView.ticket_id
                                            : { _id: selectedAnalysisToView.ticket_id, ticket_id: selectedAnalysisToView.ticket_id };
                                        setSelectedTicketForAnalysis(ticketObj);
                                        setEditingInitialData(selectedAnalysisToView);
                                        setShowWorkAnalysisModal(true);
                                        setSelectedAnalysisToView(null);
                                    }}
                                    style={{ ...styles.primaryBtn, padding: "6px 10px", fontSize: 13 }}
                                >
                                    Return / Edit Form
                                </button>
                                <button onClick={() => setSelectedAnalysisToView(null)} style={styles.iconBtn}>
                                    <CloseIcon />
                                </button>
                            </div>
                        </div>
                        <div style={styles.modalBody}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                                <div>
                                    <h5 style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>Analysis ID:</h5>
                                    <p style={{ margin: 0, fontSize: "15px", color: "#0f172a", fontWeight: "500" }}>{selectedAnalysisToView.analysis_id || selectedAnalysisToView._id}</p>
                                </div>
                                <div>
                                    <h5 style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>Ticket ID:</h5>
                                    <p style={{ margin: 0, fontSize: "15px", color: "#0f172a", fontWeight: "500" }}>
                                        {selectedAnalysisToView.ticket_id?._id || selectedAnalysisToView.ticket_id}
                                    </p>
                                </div>
                                <div>
                                    <h5 style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>Worker ID:</h5>
                                    <p style={{ margin: 0, fontSize: "15px", color: "#0f172a", fontWeight: "500" }}>{selectedAnalysisToView.worker_id}</p>
                                </div>
                                <div>
                                    <h5 style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>Ticket Status:</h5>
                                    {(() => {
                                        const ticketStatus = selectedAnalysisToView.ticket_id?.status_id?.name || selectedAnalysisToView.ticket_id?.status || "Unknown";
                                        const n = String(ticketStatus).toLowerCase();
                                        let bgColor = "#dbeafe";
                                        let textColor = "#1e40af";
                                        
                                        if (n.includes("closed")) {
                                            bgColor = "#f3f4f6";
                                            textColor = "#4b5563";
                                        } else if (n.includes("progress")) {
                                            bgColor = "#e0e7ff";
                                            textColor = "#3730a3";
                                        } else if (n.includes("resolved")) {
                                            bgColor = "#dcfce7";
                                            textColor = "#166534";
                                        }
                                        
                                        return (
                                            <span style={{
                                                display: "inline-block",
                                                background: bgColor,
                                                color: textColor,
                                                padding: "6px 12px",
                                                borderRadius: "6px",
                                                fontSize: "12px",
                                                fontWeight: "600",
                                                textTransform: "uppercase"
                                            }}>
                                                {ticketStatus}
                                            </span>
                                        );
                                    })()}
                                </div>
                                <div>
                                    <h5 style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>Material Required:</h5>
                                    <p style={{ margin: 0, fontSize: "15px", color: "#0f172a", fontWeight: "500" }}>{selectedAnalysisToView.material_required}</p>
                                </div>
                            </div>
                            {selectedAnalysisToView.material_description && (
                                <div style={{ marginTop: "24px" }}>
                                    <h5 style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>Material Description:</h5>
                                    <p style={{ margin: 0, fontSize: "14px", color: "#475569", lineHeight: "1.6" }}>{selectedAnalysisToView.material_description}</p>
                                </div>
                            )}
                            <div style={{ marginTop: "24px" }}>
                                <h5 style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>Uploaded Images:</h5>
                                {selectedAnalysisToView.uploaded_images && selectedAnalysisToView.uploaded_images.length > 0 ? (
                                    <div style={{ display: "flex", gap: "12px", marginTop: "12px", flexWrap: "wrap" }}>
                                        {selectedAnalysisToView.uploaded_images.map((img, i) => {
                                            const normalized = img && typeof img === "string" ? img.replace(/\\/g, "/") : img;
                                            const src = normalized && normalized.startsWith("http") ? normalized : `${API_ENDPOINTS.BASE_URL}/${normalized}`;
                                            return (
                                                <img 
                                                    key={i} 
                                                    src={src} 
                                                    alt={`analysis-${i}`} 
                                                    style={{ width: "140px", height: "100px", objectFit: "cover", borderRadius: "8px", border: "1px solid #e2e8f0" }} 
                                                />
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p style={{ margin: 0, fontSize: "14px", color: "#0f172a" }}>No images uploaded</p>
                                )}
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginTop: "24px" }}>
                                <div>
                                    <h5 style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>Analysis Status:</h5>
                                    {(() => {
                                        const analysisStatus = selectedAnalysisToView.material_required === "Yes" ? "Material Required" : "Complete";
                                        const isYellow = analysisStatus === "Material Required";
                                        return (
                                            <span style={{
                                                display: "inline-block",
                                                background: isYellow ? "#fef3c7" : "#dcfce7",
                                                color: isYellow ? "#92400e" : "#166534",
                                                padding: "6px 12px",
                                                borderRadius: "6px",
                                                fontSize: "13px",
                                                fontWeight: "600",
                                                textTransform: "uppercase",
                                                letterSpacing: "0.5px"
                                            }}>
                                                {analysisStatus}
                                            </span>
                                        );
                                    })()}
                                </div>
                                <div>
                                    <h5 style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>Approval Status:</h5>
                                    {(() => {
                                        const approvalStatus = selectedAnalysisToView.approval_status || "PENDING";
                                        const isApproved = approvalStatus.toLowerCase().includes("approved");
                                        const isRejected = approvalStatus.toLowerCase().includes("rejected");
                                        let bgColor = "#fffbeb";
                                        let textColor = "#f59e0b";
                                        if (isApproved) {
                                            bgColor = "#dcfce7";
                                            textColor = "#166534";
                                        } else if (isRejected) {
                                            bgColor = "#fee2e2";
                                            textColor = "#991b1b";
                                        }
                                        return (
                                            <span style={{
                                                display: "inline-block",
                                                background: bgColor,
                                                color: textColor,
                                                padding: "6px 12px",
                                                borderRadius: "6px",
                                                fontSize: "13px",
                                                fontWeight: "600",
                                                textTransform: "uppercase",
                                                letterSpacing: "0.5px"
                                            }}>
                                                {approvalStatus}
                                            </span>
                                        );
                                    })()}
                                </div>
                            </div>
                            <div style={{ marginTop: "24px" }}>
                                <h5 style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>Created At:</h5>
                                <p style={{ margin: 0, fontSize: "14px", color: "#0f172a" }}>
                                    {new Date(selectedAnalysisToView.createdAt).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header Section */}


            {/* Search Bar */}
            <div style={styles.searchBarWrapper}>
                <div style={styles.searchInputWrapper}>
                    <span style={styles.searchIcon}><SearchIcon /></span>
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={styles.searchInput}
                    />
                </div>
            </div>

            {/* Tickets Grid */}
            <div style={styles.cardContainer}>
                {filteredTickets.length === 0 ? (
                    <div style={styles.emptyState}>
                        <div style={styles.emptyStateIcon}>📋</div>
                        <h3 style={styles.emptyStateTitle}>No tickets assigned</h3>
                        <p style={styles.emptyStateText}>
                            {searchTerm ? "Try adjusting your search terms" : "You have no pending tickets assigned to you."}
                        </p>
                    </div>
                ) : (
                    <div className="responsive-grid">
                        {filteredTickets.map((ticket) => {
                            const priorityName = getPriorityName(ticket);
                            const statusName = getStatusName(ticket);
                            const isSubmitted = hasSubmittedAnalysis(ticket._id);
                            
                            return (
                                <div key={ticket._id} style={{
                                    ...styles.cardItem,
                                    borderLeft: `4px solid ${getPriorityBorderColor(priorityName)}`
                                }}>
                                    {/* Card Header */}
                                    <div style={styles.cardHeader}>
                                        <div style={styles.cardIdRow}>
                                            <span style={styles.cardId}>#{ticket.ticket_id}</span>
                                            {isSubmitted && (
                                                <span style={styles.submittedBadge}>
                                                    <CheckIcon /> Analysis Sent
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                            {isSubmitted && (
                                                <span style={{
                                                    fontSize: "12px",
                                                    fontWeight: "600",
                                                    color: "#f59e0b",
                                                    background: "#fffbeb",
                                                    padding: "4px 10px",
                                                    borderRadius: "6px",
                                                    border: "1px solid #fde68a",
                                                    textTransform: "uppercase",
                                                    letterSpacing: "0.5px"
                                                }}>
                                                    Status: Pending
                                                </span>
                                            )}
                                            <div style={styles.headerBadges}>
                                                <span style={{ ...styles.badge, ...getPriorityStyle(priorityName) }}>
                                                    {priorityName}
                                                </span>
                                                <span style={{ ...styles.badge, ...getStatusStyle(statusName) }}>
                                                    {statusName}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <div style={styles.cardContent}>
                                        <h3 style={styles.cardTitle}>{ticket.title}</h3>
                                        
                                        {/* Meta Info */}
                                        <div style={styles.metaInfo}>
                                            <div style={styles.metaItem}>
                                                <span style={styles.metaIcon}><BuildingIcon /></span>
                                                <span style={styles.metaText}>{getCompanyName(ticket)}</span>
                                            </div>
                                            <div style={styles.metaItem}>
                                                <span style={styles.metaIcon}><UserIcon /></span>
                                                <span style={styles.metaText}>{ticket.raised_by?.name || "-"}</span>
                                            </div>
                                            <div style={styles.metaItem}>
                                                <span style={styles.metaIcon}><CalendarIcon /></span>
                                                <span style={styles.metaText}>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        {ticket.image && (
                                            <div style={styles.imageThumbnailWrapper}>
                                                <img src={`${API_ENDPOINTS.BASE_URL}/${ticket.image}`} alt="Attachment" style={styles.cardImage} />
                                            </div>
                                        )}

                                        <p style={styles.cardDescription}>{ticket.description}</p>
                                    </div>

                                    {/* Card Actions */}
                                    <div style={{
                                        ...styles.cardActions,
                                        gridTemplateColumns: isSubmitted ? "1fr 1fr 1fr" : "1fr 1.2fr"
                                    }}>
                                        <button onClick={() => setViewTicket(ticket)} style={styles.secondaryBtn}>
                                            View Ticket
                                        </button>
                                        {isSubmitted && (
                                            <button 
                                                onClick={() => setSelectedAnalysisToView(getAnalysisForTicket(ticket._id))}
                                                style={{
                                                    ...styles.secondaryBtn,
                                                    color: "#3b82f6",
                                                    borderColor: "#bfdbfe"
                                                }}
                                            >
                                                View Analysis
                                            </button>
                                        )}
                                        <button
                                            onClick={() => {
                                                setSelectedTicketForAnalysis(ticket);
                                                setShowWorkAnalysisModal(true);
                                            }}
                                            style={{
                                                ...styles.primaryBtn,
                                                ...(isSubmitted ? styles.disabledBtn : {})
                                            }}
                                            disabled={isSubmitted}
                                        >
                                            {isSubmitted ? "Analyzed" : "Submit work Details"}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Styles ---
const styles = {
    pageContainer: {
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        backgroundColor: "#f8fafc", // Very light slate gray
        minHeight: "100vh",
        padding: "32px",
        color: "#1e293b",
    },
    headerSection: {
        marginBottom: "32px",
    },
    mainTitle: {
        margin: 0,
        fontSize: "32px",
        fontWeight: "800",
        color: "#0f172a",
        letterSpacing: "-0.5px",
    },
    subtitle: {
        margin: "8px 0 0 0",
        color: "#64748b",
        fontSize: "16px",
        fontWeight: "400",
    },
    searchBarWrapper: {
        marginBottom: "32px",
    },
    searchInputWrapper: {
        position: "relative",
        maxWidth: "600px",
    },
    searchIcon: {
        position: "absolute",
        left: "16px",
        top: "50%",
        transform: "translateY(-50%)",
        color: "#94a3b8",
    },
    searchInput: {
        width: "100%",
        padding: "14px 14px 14px 48px",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
        outline: "none",
        fontSize: "15px",
        backgroundColor: "white",
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
        transition: "all 0.2s",
        color: "#334155",
    },
    cardContainer: {
        background: "transparent",
    },
    
    // --- Card Styles ---
    cardItem: {
        background: "#ffffff",
        borderRadius: "16px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.2s, box-shadow 0.2s",
        position: "relative",
    },
    cardHeader: {
        padding: "16px 20px",
        borderBottom: "1px solid #f1f5f9",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    cardIdRow: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
    },
    cardId: {
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "13px",
        fontWeight: "600",
        color: "#64748b",
        letterSpacing: "0.5px",
    },
    submittedBadge: {
        display: "flex",
        alignItems: "center",
        gap: "4px",
        fontSize: "11px",
        fontWeight: "600",
        color: "#059669",
        background: "#ecfdf5",
        padding: "2px 8px",
        borderRadius: "12px",
        textTransform: "uppercase",
    },
    headerBadges: {
        display: "flex",
        gap: "6px",
    },
    badge: {
        borderRadius: "8px",
        fontWeight: "600",
        textTransform: "uppercase",
        padding: "4px 10px",
        fontSize: "11px",
        letterSpacing: "0.5px",
        border: "1px solid transparent",
    },
    
    cardContent: {
        padding: "20px",
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        gap: "16px",
    },
    cardTitle: {
        margin: 0,
        fontSize: "18px",
        fontWeight: "700",
        color: "#0f172a",
        lineHeight: "1.4",
    },
    metaInfo: {
        display: "flex",
        flexWrap: "wrap",
        gap: "16px",
        color: "#64748b",
    },
    metaItem: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        fontSize: "13px",
        fontWeight: "500",
    },
    metaIcon: {
        opacity: 0.7,
    },
    cardDescription: {
        margin: 0,
        fontSize: "14px",
        color: "#475569",
        lineHeight: "1.6",
        display: "-webkit-box",
        WebkitLineClamp: 3,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
    },
    imageThumbnailWrapper: {
        width: "50%",
        height: "160px",
        borderRadius: "8px",
        overflow: "hidden",
        border: "1px solid #f1f5f9",
    },
    cardImage: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        cursor: "pointer",
        transition: "transform 0.3s",
    },

    cardActions: {
        padding: "16px 20px",
        borderTop: "1px solid #f1f5f9",
        backgroundColor: "#fcfcfc",
        display: "grid",
        gridTemplateColumns: "1fr 1.2fr", // Analysis button slightly wider
        gap: "12px",
    },
    secondaryBtn: {
        padding: "10px",
        borderRadius: "8px",
        border: "1px solid #cbd5e1",
        background: "white",
        color: "#475569",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.2s",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    primaryBtn: {
        padding: "10px",
        borderRadius: "8px",
        border: "none",
        background: "#3b82f6", // Blue 500
        color: "white",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.2s",
        boxShadow: "0 1px 2px rgba(59, 130, 246, 0.3)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    disabledBtn: {
        background: "#cbd5e1",
        color: "#64748b",
        boxShadow: "none",
        cursor: "default",
    },

    // --- Empty State ---
    emptyState: {
        padding: "80px 20px",
        textAlign: "center",
        color: "#94a3b8",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "white",
        borderRadius: "20px",
        border: "1px dashed #cbd5e1",
    },
    emptyStateIcon: { fontSize: "64px", marginBottom: "24px", opacity: 0.8 },
    emptyStateTitle: {
        fontSize: "24px",
        fontWeight: "700",
        margin: "0 0 12px 0",
        color: "#475569",
    },
    emptyStateText: {
        fontSize: "16px",
        margin: 0,
        maxWidth: "450px",
        lineHeight: "1.6",
    },

    // --- Modals ---
    modalOverlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(4px)",
        zIndex: 9999,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        animation: "fadeIn 0.2s ease-out",
    },
    viewModal: {
        background: "white",
        width: "850px",
        maxWidth: "95%",
        borderRadius: "20px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        display: "flex",
        flexDirection: "column",
        maxHeight: "90vh",
        overflow: "hidden",
        animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
    },
    viewModalHeader: {
        padding: "24px 32px",
        borderBottom: "1px solid #e2e8f0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#f8fafc",
    },
    viewModalTitle: {
        margin: 0,
        fontSize: "22px",
        fontWeight: "700",
        color: "#0f172a",
    },
    viewModalBody: {
        padding: "0",
        overflowY: "auto",
    },
    ticketCard: {
        margin: "32px",
        backgroundColor: "white",
        borderRadius: "16px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        overflow: "hidden",
        border: "1px solid #e2e8f0",
    },
    ticketHeader: {
        padding: "24px 32px",
        borderBottom: "1px solid #f1f5f9",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    ticketId: {
        display: "flex",
        flexDirection: "column",
        gap: "4px",
    },
    ticketIdLabel: {
        fontSize: "12px",
        color: "#94a3b8",
        textTransform: "uppercase",
        letterSpacing: "1px",
        fontWeight: "600",
    },
    ticketIdValue: {
        fontSize: "20px",
        fontWeight: "800",
        color: "#0f172a",
        fontFamily: "'JetBrains Mono', monospace",
    },
    ticketStatusContainer: {
        display: "flex",
        gap: "10px",
    },
    ticketSection: {
        padding: "24px 32px",
        borderBottom: "1px solid #f1f5f9",
    },
    sectionTitle: {
        margin: "0 0 20px 0",
        fontSize: "16px",
        fontWeight: "700",
        color: "#334155",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
    },
    infoGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "24px",
    },
    infoItem: {
        display: "flex",
        flexDirection: "column",
    },
    infoLabel: {
        margin: "0 0 8px 0",
        fontSize: "13px",
        color: "#64748b",
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
    },
    infoValue: {
        margin: 0,
        fontSize: "15px",
        color: "#1e293b",
        lineHeight: "1.5",
    },
    imageContainer: {
        width: "30%",
        marginTop: "16px",
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid #e2e8f0",
    },
    detailImage: {
        width: "100%",
        display: "block",
    },
    largeModal: {
        padding: "0",
        background: "white",
        width: "750px",
        maxWidth: "90%",
        borderRadius: "20px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        display: "flex",
        flexDirection: "column",
        maxHeight: "90vh",
        animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
    },
    modalHeader: {
        padding: "24px 32px",
        borderBottom: "1px solid #e2e8f0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#f8fafc",
    },
    modalTitle: {
        margin: 0,
        fontSize: "20px",
        fontWeight: "700",
        color: "#0f172a",
    },
    modalBody: {
        padding: "32px",
        overflowY: "auto",
        backgroundColor: "#ffffff",
    },
    iconBtn: {
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "#64748b",
        padding: "8px",
        borderRadius: "8px",
        transition: "background 0.2s",
    },
    iconBtn: {
        ":hover": { background: "#f1f5f9" }
    },
    
    // --- Toast & Loading ---
    toast: {
        position: "fixed",
        top: "24px",
        right: "24px",
        padding: "16px 20px",
        borderRadius: "12px",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        minWidth: "320px",
        animation: "slideIn 0.3s ease-out",
    },
    toastSuccess: { background: "#10b981", color: "white" },
    toastError: { background: "#ef4444", color: "white" },
    toastContent: { display: "flex", alignItems: "center", gap: "12px" },
    toastMessage: { fontSize: "14px", fontWeight: "500" },
    toastClose: {
        background: "rgba(255,255,255,0.2)",
        border: "none",
        color: "white",
        cursor: "pointer",
        padding: "4px",
        borderRadius: "4px",
        marginLeft: "16px",
        opacity: 0.8,
    },
    errorIcon: { fontSize: "18px" },
    spinnerContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "60vh",
    },
    spinner: {
        width: "48px",
        height: "48px",
        border: "4px solid #e2e8f0",
        borderTop: "4px solid #3b82f6",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        marginBottom: "20px",
    },
    loadingText: {
        color: "#64748b",
        fontSize: "16px",
        fontWeight: "500",
    },
};

// --- CSS for Animations and Responsive Grid ---
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes spin { 
    0% { transform: rotate(0deg); } 
    100% { transform: rotate(360deg); } 
}
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
@keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}
@keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

/* Responsive Grid System */
.responsive-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
}

@media (min-width: 640px) {
    .responsive-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (min-width: 1024px) {
    .responsive-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

/* Hover Effects */
.cardItem:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 20px -6px rgba(0, 0, 0, 0.1), 0 4px 8px -4px rgba(0, 0, 0, 0.04);
}

.cardImage:hover {
    transform: scale(1.05);
}

.primaryBtn:hover:not(:disabled) {
    background-color: #2563eb;
    transform: translateY(-1px);
}

.secondaryBtn:hover {
    background-color: #f1f5f9;
    border-color: #94a3b8;
}
`;
document.head.appendChild(styleSheet);

export default WorkerAnalysisPage;