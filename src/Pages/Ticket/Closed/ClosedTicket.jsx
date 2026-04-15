import React, { useEffect, useState } from "react";
import { getTickets } from "@/Api/TicketApi/ticketAPI";
import "@/Components/MasterDash/master.css";
import "@/Pages/Ticket/TicketList/ticketlist.css";

const ClosedTicket = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        getTickets()
            .then(res => {
                const all = Array.isArray(res) ? res : (res?.data ?? []);
                const closed = all.filter(t => {
                    const s = (t.status?.name || t.status || '').toLowerCase();
                    return s === 'closed' || s === 'resolved' || s === 'done';
                });
                setTickets(closed);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const filtered = tickets.filter(t =>
        !search ||
        (t.subject || t.title || '').toLowerCase().includes(search.toLowerCase()) ||
        String(t.id || '').includes(search)
    );

    return (
        <div className="master-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Closed Tickets</h1>
                    <p className="page-subtitle">{tickets.length} closed tickets</p>
                </div>
            </div>

            <div className="master-card">
                <div className="card-toolbar">
                    <input
                        type="text"
                        placeholder="Search closed tickets..."
                        className="search-input"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                {error && <div className="error-banner">{error}</div>}

                {loading ? (
                    <div className="table-loading">Loading...</div>
                ) : filtered.length === 0 ? (
                    <div className="table-empty">No closed tickets found.</div>
                ) : (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Subject</th>
                                    <th>Company</th>
                                    <th>Priority</th>
                                    <th>Closed By</th>
                                    <th>Date Closed</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((ticket, i) => (
                                    <tr key={ticket.id || i}>
                                        <td>{ticket.id || i + 1}</td>
                                        <td>{ticket.subject || ticket.title || '-'}</td>
                                        <td>{ticket.company?.name || '-'}</td>
                                        <td>
                                            <span className="ticket-badge badge-low">
                                                {ticket.priority?.name || ticket.priority || '-'}
                                            </span>
                                        </td>
                                        <td>{ticket.closed_by?.name || ticket.assigned_to?.name || '-'}</td>
                                        <td>{ticket.updated_at ? new Date(ticket.updated_at).toLocaleDateString() : '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClosedTicket;
