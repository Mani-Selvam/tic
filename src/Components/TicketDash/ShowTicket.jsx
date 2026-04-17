import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getTickets } from "@/Components/Api/TicketApi/ticketAPI";
import "./showticket.css";

const ShowTicket = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const statusName = searchParams.get("status");
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTickets();
    }, [statusName]);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const res = await getTickets();
            // Normalize response to an array (handle { data: [...] } or direct array)
            const allTickets = Array.isArray(res) ? res : (res && res.data) ? res.data : [];

            // Debug logs (safe)
            console.debug("[ShowTicket] Status filter:", statusName);
            console.debug("[ShowTicket] Tickets fetched:", allTickets.length);

            if (statusName) {
                const filtered = allTickets.filter(ticket => {
                    // Match the logic from your old dashboard code
                    const ticketStatus = 
                        ticket.status_id?.status_name || 
                        ticket.status_id?.name || 
                        (ticket.status && (ticket.status.status_name || ticket.status.name)) || 
                        ticket.status || 
                        '';

                    // Case-insensitive comparison with trimmed strings
                    return String(ticketStatus).toLowerCase().trim() === String(statusName).toLowerCase().trim();
                });
                setTickets(filtered);
            } else {
                setTickets(allTickets);
            }
        } catch (error) {
            console.error("Error fetching tickets:", error);
            setTickets([]);
        } finally {
            setLoading(false);
        }
    };

    const getPriorityColor = (priority) => {
        const p = String(priority).toLowerCase();
        if (p.includes('critical')) return '#ef4444';
        if (p.includes('high')) return '#f97316';
        if (p.includes('medium')) return '#3b82f6';
        if (p.includes('low')) return '#10b981';
        return '#6b7280';
    };

    const getStatusColor = (status) => {
        const s = String(status).toLowerCase();
        if (s.includes('closed') || s.includes('resolved')) return '#10b981';
        if (s.includes('progress') || s.includes('working')) return '#3b82f6';
        if (s.includes('approved')) return '#06b6d4';
        if (s.includes('material')) return '#f97316';
        if (s.includes('raised')) return '#8b5cf6';
        return '#6b7280';
    };

    const calculateRunningDays = (createdAt, closedAt) => {
        const created = new Date(createdAt);
        const today = new Date();
        
        if (closedAt) {
            // If closed, calculate days and hours it took to close
            const closed = new Date(closedAt);
            const diffTime = closed - created;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            
            return {
                type: "closed",
                date: closed.toLocaleString(),
                days: diffDays,
                hours: diffHours,
            };
        }
        
        // Calculate days running
        const diffTime = today - created;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
        
        return {
            type: "running",
            date: null,
            days: diffDays,
            hours: null,
        };
    };

    const styles = {
        pageContainer: {
            padding: "24px",
            background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
            minHeight: "100vh",
        },
        headerSection: {
            marginBottom: "32px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
        },
        headerTitle: {
            fontSize: "28px",
            fontWeight: "700",
            color: "#0f172a",
            margin: 0,
        },
        headerSubtitle: {
            fontSize: "14px",
            color: "#64748b",
            margin: "8px 0 0 0",
        },
        backButton: {
            padding: "10px 20px",
            background: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600",
            transition: "all 0.2s",
        },
        cardContainer: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "20px",
        },
        card: {
            background: "white",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            border: "1px solid #e2e8f0",
            transition: "all 0.3s",
            cursor: "pointer",
        },
        cardHover: {
            transform: "translateY(-4px)",
            boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)",
        },
        cardHeader: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "16px",
            borderBottom: "2px solid #f1f5f9",
            paddingBottom: "12px",
        },
        ticketId: {
            fontSize: "16px",
            fontWeight: "700",
            color: "#0f172a",
        },
        badges: {
            display: "flex",
            gap: "8px",
        },
        badge: {
            padding: "4px 12px",
            borderRadius: "20px",
            fontSize: "11px",
            fontWeight: "700",
            textTransform: "uppercase",
            color: "white",
        },
        cardBody: {
            marginBottom: "16px",
        },
        cardTitle: {
            fontSize: "16px",
            fontWeight: "600",
            color: "#1e293b",
            margin: "0 0 8px 0",
        },
        cardDescription: {
            fontSize: "13px",
            color: "#64748b",
            margin: "0 0 8px 0",
            lineHeight: "1.5",
        },
        cardMeta: {
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            fontSize: "12px",
            color: "#64748b",
        },
        metaItem: {
            display: "flex",
            alignItems: "center",
            gap: "6px",
        },
        metaLabel: {
            fontWeight: "600",
            color: "#475569",
        },
        emptyState: {
            textAlign: "center",
            padding: "60px 24px",
            background: "white",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
        },
        emptyIcon: {
            fontSize: "48px",
            marginBottom: "16px",
        },
        emptyTitle: {
            fontSize: "20px",
            fontWeight: "700",
            color: "#0f172a",
            margin: "0 0 8px 0",
        },
        emptyText: {
            fontSize: "14px",
            color: "#64748b",
            margin: 0,
        },
        loadingContainer: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "400px",
            fontSize: "16px",
            color: "#64748b",
        },
    };

    if (loading) {
        return (
            <div style={styles.pageContainer}>
                <div style={styles.loadingContainer}>
                    <div style={{ textAlign: "center" }}>
                        <div style={{
                            width: "40px",
                            height: "40px",
                            border: "4px solid #e2e8f0",
                            borderTop: "4px solid #3b82f6",
                            borderRadius: "50%",
                            margin: "0 auto 16px",
                            animation: "spin 1s linear infinite",
                        }}></div>
                        Loading tickets...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.pageContainer}>
            {/* Add animation keyframes */}
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .show-ticket-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
                }
            `}</style>

            {/* Header */}
            <div style={styles.headerSection}>
                <div>
                    <h1 style={styles.headerTitle}>
                        {statusName ? `${statusName} Tickets` : "All Tickets"}
                    </h1>
                    <p style={styles.headerSubtitle}>
                        {tickets.length} ticket{tickets.length !== 1 ? "s" : ""} found
                    </p>
                </div>
                <button
                    onClick={() => navigate("/")}
                    onMouseEnter={(e) => e.target.style.opacity = "0.9"}
                    onMouseLeave={(e) => e.target.style.opacity = "1"}
                    style={styles.backButton}
                >
                    ← Back to Dashboard
                </button>
            </div>

            {/* Tickets Grid */}
            {tickets.length === 0 ? (
                <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>📋</div>
                    <h3 style={styles.emptyTitle}>No Tickets Found</h3>
                    <p style={styles.emptyText}>
                        No tickets available for "{statusName}" status
                    </p>
                </div>
            ) : (
                <div style={styles.cardContainer}>
                    {tickets.map((ticket) => (
                        <div
                            key={ticket._id}
                            className="show-ticket-card"
                            style={styles.card}
                            onClick={() => {
                                // Navigate to ticket details if needed
                                // navigate(`/ticket/${ticket._id}`);
                            }}
                        >
                            {/* Card Header */}
                            <div style={styles.cardHeader}>
                                <div style={styles.ticketId}>
                                    #{ticket.ticket_id}
                                </div>
                                <div style={styles.badges}>
                                    <span
                                        style={{
                                            ...styles.badge,
                                            background: getPriorityColor(ticket.priority_id?.name),
                                        }}
                                    >
                                        {ticket.priority_id?.name || "Medium"}
                                    </span>
                                    <span
                                        style={{
                                            ...styles.badge,
                                            background: getStatusColor(ticket.status_id?.name || ticket.status),
                                        }}
                                    >
                                        {ticket.status_id?.name || "Unknown"}
                                    </span>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div style={styles.cardBody}>
                                <h3 style={styles.cardTitle}>{ticket.title}</h3>
                                {ticket.description && (
                                    <p style={styles.cardDescription}>
                                        {ticket.description.substring(0, 100)}
                                        {ticket.description.length > 100 ? "..." : ""}
                                    </p>
                                )}
                            </div>

                            {/* Card Meta */}
                            <div style={styles.cardMeta}>
                                <div style={styles.metaItem}>
                                    <span style={styles.metaLabel}>👤</span>
                                    <span>{ticket.raised_by?.name || "Unknown"}</span>
                                </div>
                                <div style={styles.metaItem}>
                                    <span style={styles.metaLabel}>🏢</span>
                                    <span>{ticket.company_id?.name || "-"}</span>
                                </div>
                                <div style={styles.metaItem}>
                                    <span style={styles.metaLabel}>📁</span>
                                    <span>{ticket.department_id?.name || "-"}</span>
                                </div>
                                <div style={styles.metaItem}>
                                    <span style={styles.metaLabel}>📅 Created</span>
                                    <span>
                                        {new Date(ticket.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            {/* Running Days / Closed Date */}
                            {(() => {
                                const timeInfo = calculateRunningDays(ticket.createdAt, ticket.closed_at);
                                return (
                                    <div style={{
                                        marginTop: "12px",
                                        padding: "12px",
                                        borderRadius: "8px",
                                        background: timeInfo.type === "closed" ? "#dcfce7" : "#fef3c7",
                                        border: `1px solid ${timeInfo.type === "closed" ? "#bbf7d0" : "#fcd34d"}`,
                                    }}>
                                        {timeInfo.type === "closed" ? (
                                            <div>
                                                <div style={{ fontSize: "12px", fontWeight: "600", color: "#166534", marginBottom: "8px" }}>
                                                    ✅ Closed: {timeInfo.date}
                                                </div>
                                                <div style={{ fontSize: "11px", color: "#166534", lineHeight: "1.6" }}>
                                                    <div>⏱️ Time to Close: <strong>{timeInfo.days} days {timeInfo.hours} hours</strong></div>
                                                    <div>📊 Total: <strong>{timeInfo.days * 24 + timeInfo.hours} hours</strong></div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ fontSize: "12px", fontWeight: "600", color: "#b45309" }}>
                                                🔄 Running Day {timeInfo.days}
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ShowTicket;
