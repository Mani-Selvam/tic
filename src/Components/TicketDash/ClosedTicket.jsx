import React, { useEffect, useState } from "react";
import { getTickets, updateTicket, deleteTicket } from "@/Components/Api/TicketApi/ticketAPI";
import { getTicketStatuses } from "@/Components/Api/MasterApi/ticketStatusApi";
import "./ticketForm.css";

// --- Clean SVG Icons ---
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

const EyeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>
);

const FileTextIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
);

const MapPinIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
    </svg>
);

const CalendarIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
);

const DepartmentIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
);

const BuildingIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21V3a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v18"></path>
        <path d="M7 21v-8a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v8"></path>
    </svg>
);

const ClockIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
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

const ClosedTicket = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [toast, setToast] = useState({ show: false, message: "", type: "" });
    const [selectedTicketToView, setSelectedTicketToView] = useState(null);
    const [ticketStatuses, setTicketStatuses] = useState([]);
    const [viewMode, setViewMode] = useState("cards");
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });
    
    // Edit ticket state
    const [showEditModal, setShowEditModal] = useState(false);
    const [ticketToEdit, setTicketToEdit] = useState(null);
    const [editFormData, setEditFormData] = useState({ title: "", status_id: "" });
    const [editLoading, setEditLoading] = useState(false);
    
    // Delete ticket state
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [ticketToDelete, setTicketToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    
    // Check if mobile
    const isMobile = windowSize.width < 768;
    const isTablet = windowSize.width >= 768 && windowSize.width < 1024;

    // Define styles inside the component so it has access to isMobile
    const styles = {
        pageContainer: {
            padding: isMobile ? "16px" : "32px",
            background: "#f8fafc",
            minHeight: "100vh",
        },
        headerSection: {
           display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
    justifyContent: "flex-start",
    marginBottom: "24px",
        },
        pageTitle: {
            margin: 0,
            fontSize: isMobile ? "28px" : "36px",
            fontWeight: "700",
            color: "#1e293b",
            letterSpacing: "-0.5px",
        },
        pageSubtitle: {
            margin: "8px 0 0 0",
            fontSize: "16px",
            color: "#64748b",
            fontWeight: "400",
        },
        headerActions: {
            display: "flex",
            alignItems: "center",
            gap: "16px",
        },
        viewToggle: {
            display: "flex",
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            padding: "2px",
        },
        toggleBtn: {
            padding: "8px 16px",
            background: "transparent",
            border: "none",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: "500",
            color: "#64748b",
            cursor: "pointer",
            transition: "all 0.2s",
        },
        toggleBtnActive: {
            background: "#f1f5f9",
            color: "#1e293b",
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
        },
        statsBadge: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2px",
            padding: "1px 20px",
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
        },
        statsCount: {
            fontSize: "18px",
            fontWeight: "700",
            color: "#1e293b",
        },
        statsLabel: {
            fontSize: "10px",
            color: "#64748b",
            fontWeight: "500",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
        },
        toast: {
            position: "fixed",
            top: isMobile ? "16px" : "24px",
            right: isMobile ? "16px" : "24px",
            padding: "16px 20px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            zIndex: 9999,
            animation: "slideIn 0.3s ease-out",
            maxWidth: isMobile ? "calc(100vw - 32px)" : "400px",
        },
        toastSuccess: {
            background: "white",
            color: "#166534",
            border: "1px solid #dcfce7",
        },
        toastError: {
            background: "white",
            color: "#991b1b",
            border: "1px solid #fee2e2",
        },
        toastContent: {
            display: "flex",
            alignItems: "center",
            gap: "12px",
        },
        toastMessage: {
            fontSize: "14px",
            fontWeight: "500",
        },
        toastClose: {
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0",
            color: "#94a3b8",
        },
        errorIcon: {
            fontSize: "18px",
        },
        modalOverlay: {
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            padding: isMobile ? "0" : "20px",
        },
        modalLarge: {
            background: "white",
            borderRadius: isMobile ? "16px 16px 0 0" : "12px",
            maxWidth: isMobile ? "100%" : "800px",
            width: isMobile ? "100%" : "90%",
            maxHeight: isMobile ? "90vh" : "85vh",
            overflow: "hidden",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
            display: "flex",
            flexDirection: "column",
        },
        modalMobile: {
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            maxHeight: "90vh",
            borderRadius: "16px 16px 0 0",
            animation: "slideUp 0.3s ease-out",
        },
        modalHeader: {
            background: "#f8fafc",
            padding: isMobile ? "20px" : "24px",
            borderBottom: "1px solid #e2e8f0",
            position: "relative",
        },
        modalHeaderContent: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
        },
        modalHeaderLeft: {
            display: "flex",
            alignItems: "center",
            gap: "16px",
        },
        modalTitle: {
            margin: 0,
            fontSize: isMobile ? "20px" : "24px",
            fontWeight: "600",
            color: "#1e293b",
        },
        modalSubtitle: {
            margin: "4px 0 0 0",
            fontSize: "14px",
            color: "#64748b",
            fontWeight: "400",
        },
        iconCircle: {
            width: "48px",
            height: "48px",
            borderRadius: "8px",
            background: "#f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#475569",
        },
        iconBtn: {
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            color: "#64748b",
            transition: "all 0.2s",
        },
        modalBody: {
            padding: isMobile ? "20px" : "24px",
            overflowY: "auto",
            flex: 1,
        },
        quickInfoGrid: {
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
            gap: "16px",
            marginBottom: "24px",
        },
        quickInfoCard: {
            background: "#f8fafc",
            padding: "16px",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            gap: "12px",
        },
        quickInfoIcon: {
            width: "40px",
            height: "40px",
            borderRadius: "6px",
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#64748b",
        },
        quickInfoLabel: {
            margin: "0 0 4px 0",
            fontSize: "12px",
            color: "#64748b",
            fontWeight: "500",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
        },
        quickInfoValue: {
            margin: 0,
            fontSize: "16px",
            fontWeight: "600",
            color: "#1e293b",
        },
        titleSection: {
            marginBottom: "24px",
        },
        sectionTitle: {
            margin: "0 0 12px 0",
            fontSize: "16px",
            fontWeight: "600",
            color: "#1e293b",
        },
        titleText: {
            margin: 0,
            fontSize: "18px",
            fontWeight: "500",
            color: "#334155",
            lineHeight: "1.5",
        },
        statusGrid: {
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: "16px",
            marginBottom: "24px",
        },
        statusCard: {
            background: "#f8fafc",
            padding: "16px",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
        },
        statusLabel: {
            margin: "0 0 8px 0",
            fontSize: "12px",
            color: "#64748b",
            fontWeight: "500",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
        },
        statusBadgeLarge: {
            display: "inline-block",
            padding: "6px 12px",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
        },
        descriptionSection: {
            marginBottom: "24px",
        },
        descriptionCard: {
            background: "#f8fafc",
            padding: "16px",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
        },
        descriptionText: {
            margin: 0,
            fontSize: "15px",
            color: "#475569",
            lineHeight: "1.6",
        },
        locationSection: {
            marginBottom: "24px",
        },
        locationCard: {
            background: "#f8fafc",
            padding: "16px",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
        },
        locationContent: {
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "15px",
            color: "#475569",
            fontWeight: "500",
        },
        locationBtn: {
            padding: "8px 16px",
            background: "white",
            color: "#475569",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "500",
            transition: "all 0.2s",
        },
        timestampGrid: {
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: "16px",
        },
        timestampCard: {
            background: "#f8fafc",
            padding: "16px",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            gap: "12px",
        },
        timestampLabel: {
            margin: "0 0 4px 0",
            fontSize: "12px",
            color: "#64748b",
            fontWeight: "500",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
        },
        timestampValue: {
            margin: 0,
            fontSize: "14px",
            color: "#475569",
            fontWeight: "500",
        },
     
        searchInputWrapper: {
            position: "relative",
            display: "flex",
            alignItems: "center",
        },
        searchIcon: {
            position: "absolute",
            left: "16px",
            color: "#94a3b8",
            display: "flex",
            alignItems: "center",
            pointerEvents: "none",
        },
        searchInput: {
            width: "100%",
            padding: "12px 16px 12px 44px",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            fontSize: "15px",
            background: "white",
            outline: "none",
            transition: "border-color 0.2s",
        },
        cardContainer: {
            background: "white",
            borderRadius: "12px",
            padding: isMobile ? "16px" : "24px",
        },
        cardsContainer: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
            gap: "20px",
        },
        cardsContainerMobile: {
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "16px",
        },
        card: {
            background: "white",
            borderRadius: "8px",
            overflow: "hidden",
            border: "1px solid #e2e8f0",
            transition: "all 0.2s",
        },
        cardHeader: {
            background: "#f8fafc",
            padding: "16px 20px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
        },
        cardHeaderTop: {
            display: "flex",
            alignItems: "center",
            gap: "12px",
        },
        cardBody: {
            padding: "20px",
        },
        cardTitle: {
            margin: "0 0 16px 0",
            fontSize: "16px",
            fontWeight: "600",
            color: "#1e293b",
            lineHeight: "1.4",
        },
        cardInfoGrid: {
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "12px",
        },
        cardInfoItem: {
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px",
            background: "#f8fafc",
            borderRadius: "6px",
        },
        infoLabel: {
            margin: "0 0 4px 0",
            fontSize: "11px",
            color: "#64748b",
            fontWeight: "500",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
        },
        infoValue: {
            margin: 0,
            fontSize: "14px",
            color: "#1e293b",
            fontWeight: "500",
        },
        cardFooter: {
            padding: "16px 20px",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "center",
        },
        enhancedViewBtn: {
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 20px",
            background: "#1e293b",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
            transition: "all 0.2s",
        },
        ticketIdBadge: {
            display: "inline-block",
            padding: "4px 10px",
            background: "#f1f5f9",
            color: "#475569",
            borderRadius: "4px",
            fontWeight: "600",
            fontSize: "12px",
            fontFamily: "'JetBrains Mono', monospace",
        },
        priorityBadge: {
            display: "inline-block",
            padding: "3px 8px",
            borderRadius: "4px",
            fontSize: "11px",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
        },
        statusBadge: {
            display: "inline-block",
            padding: "4px 10px",
            background: "#f1f5f9",
            color: "#475569",
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
        },
        emptyState: {
            textAlign: "center",
            padding: "60px 24px",
        },
        emptyIcon: {
            fontSize: "48px",
            marginBottom: "16px",
            opacity: 0.5,
        },
        emptyTitle: {
            margin: "0 0 8px 0",
            fontSize: "20px",
            fontWeight: "600",
            color: "#1e293b",
        },
        emptyText: {
            margin: 0,
            fontSize: "15px",
            color: "#64748b",
        },
        tableWrapper: {
            overflowX: "auto",
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
        },
        table: {
            width: "100%",
            borderCollapse: "collapse",
        },
        tableHeaderRow: {
            background: "#f8fafc",
            borderBottom: "1px solid #e2e8f0",
        },
        tableTh: {
            padding: "12px 16px",
            textAlign: "left",
            fontSize: "12px",
            fontWeight: "600",
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
        },
        tableRowEven: {
            background: "white",
            borderBottom: "1px solid #f1f5f9",
        },
        tableRowOdd: {
            background: "#f8fafc",
            borderBottom: "1px solid #f1f5f9",
        },
        tableTd: {
            padding: "12px 16px",
            fontSize: "14px",
            color: "#334155",
            fontWeight: "500",
        },
        spinnerContainer: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "80px 24px",
        },
        spinner: {
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            border: "3px solid #e2e8f0",
            borderTop: "3px solid #1e293b",
            animation: "spin 1s linear infinite",
        },
        loadingText: {
            marginTop: "16px",
            fontSize: "15px",
            color: "#64748b",
            fontWeight: "500",
        },
    };

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
            // Automatically switch to card view on mobile
            if (window.innerWidth < 768) {
                setViewMode("cards");
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const initPage = async () => {
            setLoading(true);
            try {
                const statuses = await getTicketStatuses();
                setTicketStatuses(statuses || []);
                await fetchClosedTickets();
            } finally {
                setLoading(false);
            }
        };
        initPage();
    }, []);

    const fetchClosedTickets = async () => {
        try {
            const allTickets = await getTickets(false);
            const ticketsArray = Array.isArray(allTickets) ? allTickets : allTickets.data || [];
            
            const closedTickets = ticketsArray.filter((ticket) => {
                const statusName = ticket.status_id?.name || ticket.status || "";
                return String(statusName).toLowerCase() === "closed";
            });

            setTickets(closedTickets);
        } catch (error) {
            console.error("Error fetching closed tickets:", error);
            showToast("Failed to load closed tickets", "error");
        }
    };

    const showToast = (message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: "", type }), 3000);
    };

    const handleEditTicket = (ticket) => {
        setTicketToEdit(ticket);
        setEditFormData({
            title: ticket.title || "",
            status_id: ticket.status_id?._id || ticket.status_id || ""
        });
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        if (!ticketToEdit || !editFormData.title.trim()) {
            showToast("Please enter a ticket name", "error");
            return;
        }

        try {
            setEditLoading(true);
            const updatePayload = {
                title: editFormData.title,
                status_id: editFormData.status_id
            };
            
            await updateTicket(ticketToEdit._id, updatePayload);
            showToast("✅ Ticket updated successfully!", "success");
            
            setShowEditModal(false);
            setTicketToEdit(null);
            
            // Refresh the ticket list
            await fetchClosedTickets();
        } catch (error) {
            console.error("Error updating ticket:", error);
            showToast("Failed to update ticket: " + error.message, "error");
        } finally {
            setEditLoading(false);
        }
    };

    const openMap = (query) => {
        if (!query) return;
        if (navigator && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const origin = `${pos.coords.latitude},${pos.coords.longitude}`;
                    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(query)}&travelmode=driving`;
                    window.open(url, '_blank');
                },
                (err) => {
                    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}&travelmode=driving`;
                    window.open(url, '_blank');
                    showToast('Opened directions without start location', 'info');
                },
                { timeout: 5000 }
            );
        } else {
            const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}&travelmode=driving`;
            window.open(url, '_blank');
        }
    };

    const getStatusStyle = (statusName) => {
        const n = String(statusName).toLowerCase();
        let bgColor = "#f1f5f9";
        let textColor = "#475569";

        if (n.includes("closed")) {
            bgColor = "#f8fafc";
            textColor = "#64748b";
        } else if (n.includes("progress")) {
            bgColor = "#eff6ff";
            textColor = "#1e40af";
        } else if (n.includes("resolved")) {
            bgColor = "#f0fdf4";
            textColor = "#166534";
        }

        return { backgroundColor: bgColor, color: textColor };
    };

    const getPriorityStyle = (priorityName) => {
        const n = String(priorityName).toLowerCase();
        let bgColor = "#f0fdf4";
        let textColor = "#166534";

        if (n.includes("high")) {
            bgColor = "#fef2f2";
            textColor = "#991b1b";
        } else if (n.includes("medium")) {
            bgColor = "#fffbeb";
            textColor: "#92400e";
        } else if (n.includes("low")) {
            bgColor = "#f0f9ff";
            textColor: "#0c4a6e";
        }

        return { backgroundColor: bgColor, color: textColor };
    };

    const filteredTickets = tickets.filter((ticket) => {
        const term = searchTerm.toLowerCase();
        const id = String(ticket.ticket_id || "").toLowerCase();
        const title = String(ticket.title || "").toLowerCase();
        const desc = String(ticket.description || "").toLowerCase();
        return id.includes(term) || title.includes(term) || desc.includes(term);
    });

    if (loading) {
        return (
            <div style={styles.pageContainer}>
                <div style={styles.spinnerContainer}>
                    <div style={styles.spinner}></div>
                    <p style={styles.loadingText}>Loading closed tickets...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.pageContainer}>
            {/* --- Clean Page Header --- */}
            <div style={styles.headerSection}>
                <div>
                    <h2 style={styles.pageTitle}>Closed Tickets</h2>
                    <p style={styles.pageSubtitle}>View and manage all closed tickets</p>
                </div>
                  {/* --- Search Bar --- */}
            <div style={styles.searchWrapper}>
                <div style={styles.searchInputWrapper}>
                    <span style={styles.searchIcon}>
                        <SearchIcon />
                    </span>
                    <input
                        type="text"
                        placeholder="Search "
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={styles.searchInput}
                    />
                </div>
            </div>
                <div style={styles.headerActions}>
                    {!isMobile && (
                        <div style={styles.viewToggle}>
                            <button 
                                style={{
                                    ...styles.toggleBtn,
                                    ...(viewMode === "cards" ? styles.toggleBtnActive : {})
                                }}
                                onClick={() => setViewMode("cards")}
                            >
                                Cards
                            </button>
                            <button 
                                style={{
                                    ...styles.toggleBtn,
                                    ...(viewMode === "table" ? styles.toggleBtnActive : {})
                                }}
                                onClick={() => setViewMode("table")}
                            >
                                Table
                            </button>
                        </div>
                    )}
                    <div style={styles.statsBadge}>
                        <span style={styles.statsCount}>{filteredTickets.length}</span>
                        <span style={styles.statsLabel}>Tickets</span>
                    </div>
                </div>
            </div>

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
                        {toast.type === "success" ? <CheckIcon /> : <span style={styles.errorIcon}>⚠</span>}
                        <span style={styles.toastMessage}>{toast.message}</span>
                    </div>
                    <button style={styles.toastClose} onClick={() => setToast({ show: false, message: "", type: "" })}>
                        <CloseIcon />
                    </button>
                </div>
            )}

            {/* --- Clean Ticket View Modal --- */}
            {selectedTicketToView && (
                <div style={styles.modalOverlay} onClick={() => setSelectedTicketToView(null)}>
                    <div style={{
                        ...styles.modalLarge,
                        ...(isMobile ? styles.modalMobile : {})
                    }} onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div style={styles.modalHeader}>
                            <div style={styles.modalHeaderContent}>
                                <div style={styles.modalHeaderLeft}>
                                    <div style={styles.iconCircle}>
                                        <FileTextIcon />
                                    </div>
                                    <div>
                                        <h3 style={styles.modalTitle}>Ticket Details</h3>
                                        <p style={styles.modalSubtitle}>{selectedTicketToView.ticket_id}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedTicketToView(null)} style={styles.iconBtn}>
                                    <CloseIcon />
                                </button>
                            </div>
                        </div>
                        
                        {/* Modal Body */}
                        <div style={styles.modalBody}>
                            {/* Quick Info Cards */}
                            <div style={styles.quickInfoGrid}>
                                <div style={styles.quickInfoCard}>
                                    <div style={styles.quickInfoIcon}>
                                        <DepartmentIcon />
                                    </div>
                                    <div>
                                        <p style={styles.quickInfoLabel}>Department</p>
                                        <p style={styles.quickInfoValue}>{selectedTicketToView.department_id?.name || "-"}</p>
                                    </div>
                                </div>
                                <div style={styles.quickInfoCard}>
                                    <div style={styles.quickInfoIcon}>
                                        <BuildingIcon />
                                    </div>
                                    <div>
                                        <p style={styles.quickInfoLabel}>Company</p>
                                        <p style={styles.quickInfoValue}>{selectedTicketToView.company_id?.name || "-"}</p>
                                    </div>
                                </div>
                                <div style={styles.quickInfoCard}>
                                    <div style={styles.quickInfoIcon}>
                                        <CalendarIcon />
                                    </div>
                                    <div>
                                        <p style={styles.quickInfoLabel}>Closed Date</p>
                                        <p style={styles.quickInfoValue}>
                                            {selectedTicketToView.closed_at 
                                                ? new Date(selectedTicketToView.closed_at).toLocaleDateString() 
                                                : "-"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Title Section */}
                            <div style={styles.titleSection}>
                                <h4 style={styles.sectionTitle}>Ticket Title</h4>
                                <p style={styles.titleText}>{selectedTicketToView.title}</p>
                            </div>

                            {/* Status and Priority */}
                            <div style={styles.statusGrid}>
                                <div style={styles.statusCard}>
                                    <p style={styles.statusLabel}>Status</p>
                                    <span style={{
                                        ...styles.statusBadgeLarge,
                                        ...getStatusStyle(selectedTicketToView.status_id?.name || selectedTicketToView.status)
                                    }}>
                                        {selectedTicketToView.status_id?.name || selectedTicketToView.status || "Unknown"}
                                    </span>
                                </div>
                                <div style={styles.statusCard}>
                                    <p style={styles.statusLabel}>Priority</p>
                                    <span style={{
                                        ...styles.statusBadgeLarge,
                                        ...getPriorityStyle(selectedTicketToView.priority_id?.name)
                                    }}>
                                        {selectedTicketToView.priority_id?.name || "-"}
                                    </span>
                                </div>
                            </div>

                            {/* Description */}
                            {selectedTicketToView.description && (
                                <div style={styles.descriptionSection}>
                                    <h4 style={styles.sectionTitle}>Description</h4>
                                    <div style={styles.descriptionCard}>
                                        <p style={styles.descriptionText}>{selectedTicketToView.description}</p>
                                    </div>
                                </div>
                            )}

                            {/* Location */}
                            {selectedTicketToView.location && (
                                <div style={styles.locationSection}>
                                    <h4 style={styles.sectionTitle}>Location</h4>
                                    <div style={styles.locationCard}>
                                        <div style={styles.locationContent}>
                                            <MapPinIcon />
                                            <span>{selectedTicketToView.location}</span>
                                        </div>
                                        <button
                                            style={styles.locationBtn}
                                            onClick={() => openMap(selectedTicketToView.location)}
                                        >
                                            Open in Maps
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Timestamps */}
                            <div style={styles.timestampGrid}>
                                <div style={styles.timestampCard}>
                                    <ClockIcon />
                                    <div>
                                        <p style={styles.timestampLabel}>Created On</p>
                                        <p style={styles.timestampValue}>
                                            {new Date(selectedTicketToView.created_at || selectedTicketToView.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <div style={styles.timestampCard}>
                                    <ClockIcon />
                                    <div>
                                        <p style={styles.timestampLabel}>Last Updated</p>
                                        <p style={styles.timestampValue}>
                                            {new Date(selectedTicketToView.updated_at || selectedTicketToView.updatedAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

          

            {/* --- Tickets List --- */}
            <div style={styles.cardContainer}>
                {filteredTickets.length === 0 ? (
                    <div style={styles.emptyState}>
                        <div style={styles.emptyIcon}>📋</div>
                        <h3 style={styles.emptyTitle}>No Closed Tickets</h3>
                        <p style={styles.emptyText}>
                            {searchTerm
                                ? "Try adjusting your search terms"
                                : "No closed tickets found"}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Card View */}
                        {(viewMode === "cards" || isMobile) && (
                            <div style={isMobile ? styles.cardsContainerMobile : styles.cardsContainer}>
                                {filteredTickets.map((ticket, idx) => (
                                    <div key={idx} style={styles.card}>
                                        {/* Card Header */}
                                        <div style={styles.cardHeader}>
                                            <div style={styles.cardHeaderTop}>
                                                <span style={styles.ticketIdBadge}>{ticket.ticket_id}</span>
                                                <span style={{
                                                    ...styles.priorityBadge,
                                                    ...getPriorityStyle(ticket.priority_id?.name)
                                                }}>
                                                    {ticket.priority_id?.name || "-"}
                                                </span>
                                            </div>
                                            <span style={{
                                                ...styles.statusBadge,
                                                ...getStatusStyle(ticket.status_id?.name || ticket.status)
                                            }}>
                                                {ticket.status_id?.name || ticket.status || "Unknown"}
                                            </span>
                                        </div>
                                        
                                        {/* Card Body */}
                                        <div style={styles.cardBody}>
                                            <h3 style={styles.cardTitle}>{ticket.title}</h3>
                                            
                                            {/* Info Grid */}
                                            <div style={styles.cardInfoGrid}>
                                                <div style={styles.cardInfoItem}>
                                                    <DepartmentIcon />
                                                    <div>
                                                        <p style={styles.infoLabel}>Department</p>
                                                        <p style={styles.infoValue}>{ticket.department_id?.name || "-"}</p>
                                                    </div>
                                                </div>
                                                <div style={styles.cardInfoItem}>
                                                    <CalendarIcon />
                                                    <div>
                                                        <p style={styles.infoLabel}>Closed Date</p>
                                                        <p style={styles.infoValue}>
                                                            {ticket.closed_at 
                                                                ? new Date(ticket.closed_at).toLocaleDateString() 
                                                                : "-"}
                                                        </p>
                                                    </div>
                                                </div>
                                                {ticket.location && (
                                                    <div style={styles.cardInfoItem}>
                                                        <MapPinIcon />
                                                        <div>
                                                            <p style={styles.infoLabel}>Location</p>
                                                            <p style={styles.infoValue}>{ticket.location}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Card Footer */}
                                        <div style={styles.cardFooter}>
                                            <button
                                                onClick={() => setSelectedTicketToView(ticket)}
                                                style={styles.enhancedViewBtn}
                                            >
                                                <EyeIcon />
                                                <span>View Details</span>
                                            </button>
                                            <button
                                                onClick={() => handleEditTicket(ticket)}
                                                style={{
                                                    ...styles.enhancedViewBtn,
                                                    background: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
                                                    marginLeft: "8px"
                                                }}
                                            >
                                                <span>✎</span>
                                                <span>Edit</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Table View */}
                        {viewMode === "table" && !isMobile && (
                            <div style={styles.tableWrapper}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr style={styles.tableHeaderRow}>
                                            <th style={styles.tableTh}>Ticket ID</th>
                                            <th style={styles.tableTh}>Title</th>
                                            <th style={styles.tableTh}>Department</th>
                                            <th style={styles.tableTh}>Priority</th>
                                            <th style={styles.tableTh}>Status</th>
                                            <th style={styles.tableTh}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTickets.map((ticket, idx) => (
                                            <tr key={idx} style={idx % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd}>
                                                <td style={styles.tableTd}>
                                                    <span style={styles.ticketIdBadge}>{ticket.ticket_id}</span>
                                                </td>
                                                <td style={styles.tableTd}>{ticket.title}</td>
                                                <td style={styles.tableTd}>{ticket.department_id?.name || "-"}</td>
                                                <td style={styles.tableTd}>
                                                    <span style={{
                                                        display: "inline-block",
                                                        padding: "3px 8px",
                                                        borderRadius: "4px",
                                                        fontSize: "11px",
                                                        fontWeight: "600",
                                                        textTransform: "uppercase",
                                                        letterSpacing: "0.5px",
                                                        ...getPriorityStyle(ticket.priority_id?.name)
                                                    }}>
                                                        {ticket.priority_id?.name || "-"}
                                                    </span>
                                                </td>
                                                <td style={styles.tableTd}>
                                                    <span style={{
                                                        display: "inline-block",
                                                        padding: "3px 8px",
                                                        borderRadius: "4px",
                                                        fontSize: "11px",
                                                        fontWeight: "600",
                                                        textTransform: "uppercase",
                                                        letterSpacing: "0.5px",
                                                        ...getStatusStyle(ticket.status_id?.name || ticket.status)
                                                    }}>
                                                        {ticket.status_id?.name || ticket.status || "Unknown"}
                                                    </span>
                                                </td>
                                                <td style={styles.tableTd}>
                                                    <button
                                                        onClick={() => setSelectedTicketToView(ticket)}
                                                        style={styles.enhancedViewBtn}
                                                    >
                                                        <EyeIcon />
                                                        <span>View</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* --- Edit Ticket Modal --- */}
            {showEditModal && ticketToEdit && (
                <div style={styles.modalOverlay} onClick={() => !editLoading && setShowEditModal(false)}>
                    <div style={{
                        ...styles.modalLarge,
                        ...(isMobile ? styles.modalMobile : {})
                    }} onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div style={styles.modalHeader}>
                            <div>
                                <h3 style={styles.modalTitle}>Edit Ticket</h3>
                                <p style={styles.modalSubtitle}>{ticketToEdit.ticket_id}</p>
                            </div>
                            <button onClick={() => !editLoading && setShowEditModal(false)} style={styles.iconBtn}>
                                <CloseIcon />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div style={styles.modalBody}>
                            {/* Ticket Name */}
                            <div style={{ marginBottom: "24px" }}>
                                <label style={{
                                    display: "block",
                                    fontSize: "14px",
                                    fontWeight: "600",
                                    color: "#1e293b",
                                    marginBottom: "8px"
                                }}>
                                    Ticket Name
                                </label>
                                <input
                                    type="text"
                                    value={editFormData.title}
                                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                                    style={{
                                        width: "100%",
                                        padding: "12px 16px",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "8px",
                                        fontSize: "14px",
                                        fontFamily: "inherit",
                                        transition: "all 0.2s",
                                        outline: "none",
                                        boxSizing: "border-box"
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = "#667eea"}
                                    onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                                />
                            </div>

                            {/* Ticket Status */}
                            <div style={{ marginBottom: "24px" }}>
                                <label style={{
                                    display: "block",
                                    fontSize: "14px",
                                    fontWeight: "600",
                                    color: "#1e293b",
                                    marginBottom: "8px"
                                }}>
                                    Change Status
                                </label>
                                <select
                                    value={editFormData.status_id}
                                    onChange={(e) => setEditFormData({ ...editFormData, status_id: e.target.value })}
                                    style={{
                                        width: "100%",
                                        padding: "12px 16px",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "8px",
                                        fontSize: "14px",
                                        fontFamily: "inherit",
                                        cursor: "pointer",
                                        outline: "none",
                                        boxSizing: "border-box",
                                        background: "white"
                                    }}
                                >
                                    <option value="">-- Select Status --</option>
                                    {ticketStatuses.map((status) => (
                                        <option key={status._id} value={status._id}>
                                            {status.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Info Box */}
                            <div style={{
                                background: "#f0fdf4",
                                border: "1px solid #bbf7d0",
                                borderRadius: "8px",
                                padding: "16px",
                                marginBottom: "24px"
                            }}>
                                <p style={{ margin: 0, fontSize: "14px", color: "#166534" }}>
                                    ℹ️ You can edit the ticket name and change its status to any available status.
                                </p>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div style={{
                            padding: "20px 24px",
                            borderTop: "1px solid #e2e8f0",
                            display: "flex",
                            gap: "12px",
                            justifyContent: "flex-end"
                        }}>
                            <button
                                onClick={() => setShowEditModal(false)}
                                disabled={editLoading}
                                style={{
                                    padding: "10px 24px",
                                    background: "#f1f5f9",
                                    color: "#1e293b",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "8px",
                                    cursor: editLoading ? "not-allowed" : "pointer",
                                    fontWeight: "600",
                                    fontSize: "14px",
                                    transition: "all 0.2s",
                                    opacity: editLoading ? 0.5 : 1
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                disabled={editLoading}
                                style={{
                                    padding: "10px 24px",
                                    background: editLoading ? "#cbd5e1" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "8px",
                                    cursor: editLoading ? "not-allowed" : "pointer",
                                    fontWeight: "600",
                                    fontSize: "14px",
                                    transition: "all 0.2s",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px"
                                }}
                            >
                                {editLoading ? (
                                    <>
                                        <div style={{
                                            width: "16px",
                                            height: "16px",
                                            border: "2px solid rgba(255,255,255,0.3)",
                                            borderTop: "2px solid white",
                                            borderRadius: "50%",
                                            animation: "spin 0.6s linear infinite"
                                        }} />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>✓</span>
                                        <span>Save Changes</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Add CSS animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideUp {
        from { transform: translateY(100%); }
        to { transform: translateY(0); }
    }
`;
document.head.appendChild(styleSheet);

export default ClosedTicket;