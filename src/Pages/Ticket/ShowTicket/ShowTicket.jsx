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
                    <button className="btn-secondary" onClick={() => navigate('/ticket/ticket')}>Back to List</button>
                </div>
                <div className="show-card">
                    <div className="table-empty">No ticket data found. Please go back and select a ticket.</div>
                </div>
            </div>
        );
    }

    const fields = [
        { label: "Subject", value: ticket.subject || ticket.title },
        { label: "Company", value: ticket.company?.name || ticket.company },
        { label: "Priority", value: ticket.priority?.name || ticket.priority },
        { label: "Status", value: ticket.status?.name || ticket.status },
        { label: "Assigned To", value: ticket.assigned_to?.name || ticket.assignee?.name },
        { label: "Department", value: ticket.department?.name || ticket.department },
        { label: "Created At", value: ticket.created_at ? new Date(ticket.created_at).toLocaleString() : null },
        { label: "Updated At", value: ticket.updated_at ? new Date(ticket.updated_at).toLocaleString() : null },
    ];

    return (
        <div className="master-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Ticket #{ticket.id}</h1>
                    <p className="page-subtitle">Ticket details and information</p>
                </div>
                <button className="btn-secondary" onClick={() => navigate('/ticket/ticket')}>Back to List</button>
            </div>

            <div className="show-card">
                <div className="show-grid">
                    {fields.map(({ label, value }) => value ? (
                        <div key={label} className="show-field">
                            <span className="show-label">{label}</span>
                            <span className="show-value">{value}</span>
                        </div>
                    ) : null)}
                </div>
                {ticket.description && (
                    <div className="show-description">
                        <span className="show-label">Description</span>
                        <p className="description-text">{ticket.description}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShowTicket;
