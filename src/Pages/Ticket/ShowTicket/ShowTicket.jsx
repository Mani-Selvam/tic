import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "@/Components/MasterDash/master.css";
import "./showticket.css";

const ShowTicket = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const ticket = state?.ticket;

    if (!ticket) {
        return (
            <div className="master-page">
                <div className="page-header">
                    <h1 className="page-title">Ticket Details</h1>
                    <button
                        className="btn-secondary"
                        onClick={() => navigate("/ticket/ticket")}>
                        Back to List
                    </button>
                </div>
                <div className="show-card">
                    <div className="table-empty">
                        No ticket data. Please go back and select a ticket.
                    </div>
                </div>
            </div>
        );
    }

    const fields = [
        { label: "Ticket ID", value: ticket.ticket_id },
        { label: "Title", value: ticket.title },
        {
            label: "Company",
            value: ticket.company_id?.name || ticket.company?.name,
        },
        {
            label: "Department",
            value: ticket.department_id?.name || ticket.department?.name,
        },
        {
            label: "Priority",
            value: ticket.priority_id?.name || ticket.priority?.name,
        },
        {
            label: "Status",
            value: ticket.status_id?.name || ticket.status?.name,
        },
        { label: "Approval Status", value: ticket.approval_status },
        { label: "Location", value: ticket.location },
        { label: "Raised By", value: ticket.raised_by?.name },
        {
            label: "Assigned To",
            value: Array.isArray(ticket.assigned_to)
                ? ticket.assigned_to
                      .map((u) => u?.name)
                      .filter(Boolean)
                      .join(", ")
                : ticket.assigned_to?.name,
        },
        { label: "Approver", value: ticket.approver_id?.name },
        {
            label: "Created At",
            value: ticket.createdAt
                ? new Date(ticket.createdAt).toLocaleString()
                : null,
        },
        {
            label: "Updated At",
            value: ticket.updatedAt
                ? new Date(ticket.updatedAt).toLocaleString()
                : null,
        },
        {
            label: "Closed At",
            value: ticket.closed_at
                ? new Date(ticket.closed_at).toLocaleString()
                : null,
        },
    ];

    return (
        <div className="master-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        Ticket #{ticket.ticket_id || ticket._id}
                    </h1>
                    <p className="page-subtitle">
                        Full details and information
                    </p>
                </div>
                <button
                    className="btn-secondary"
                    onClick={() => navigate("/ticket/ticket")}>
                    Back to List
                </button>
            </div>
            <div className="show-card">
                <div className="show-grid">
                    {fields
                        .filter((f) => f.value)
                        .map(({ label, value }) => (
                            <div key={label} className="show-field">
                                <span className="show-label">{label}</span>
                                <span className="show-value">{value}</span>
                            </div>
                        ))}
                </div>
                {ticket.description && (
                    <div className="show-description">
                        <span className="show-label">Description</span>
                        <p className="description-text">{ticket.description}</p>
                    </div>
                )}
                {ticket.image && (
                    <div style={{ marginTop: 20 }}>
                        <span className="show-label">Attachment</span>
                        <div style={{ marginTop: 8 }}>
                            <img
                                src={`${import.meta.env.VITE_API_URL || ""}${ticket.image}`}
                                alt="Attachment"
                                style={{
                                    maxWidth: "100%",
                                    borderRadius: 8,
                                    border: "1px solid #e2e8f0",
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShowTicket;
