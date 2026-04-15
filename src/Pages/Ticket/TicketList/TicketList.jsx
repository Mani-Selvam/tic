import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTickets, deleteTicket } from "@/Api/TicketApi/ticketAPI";
import { companyAPI, priorityAPI, ticketStatusAPI, userAPI } from "@/Api/MasterApi/masterAPI";
import "@/Components/MasterDash/master.css";
import "./ticketlist.css";

const TicketList = () => {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState({ company: "", priority: "", status: "" });
    const [companies, setCompanies] = useState([]);
    const [priorities, setPriorities] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const load = () => {
        setLoading(true);
        Promise.allSettled([
            getTickets(),
            companyAPI.getAll(),
            priorityAPI.getAll(),
            ticketStatusAPI.getAll(),
        ]).then(([t, c, p, s]) => {
            if (t.status === 'fulfilled') setTickets(Array.isArray(t.value) ? t.value : (t.value?.data ?? []));
            else setError(t.reason?.message || "Failed to load tickets");
            if (c.status === 'fulfilled') setCompanies(Array.isArray(c.value) ? c.value : (c.value?.data ?? []));
            if (p.status === 'fulfilled') setPriorities(Array.isArray(p.value) ? p.value : (p.value?.data ?? []));
            if (s.status === 'fulfilled') setStatuses(Array.isArray(s.value) ? s.value : (s.value?.data ?? []));
            setLoading(false);
        });
    };

    useEffect(() => { load(); }, []);

    const handleDelete = async (id) => {
        try {
            await deleteTicket(id);
            setDeleteConfirm(null);
            load();
        } catch (err) { alert(err.message || "Delete failed"); }
    };

    const filtered = tickets.filter(t => {
        const searchMatch = !search ||
            (t.subject || t.title || '').toLowerCase().includes(search.toLowerCase()) ||
            String(t.id || '').includes(search);
        const companyId = t.company?.id || t.company_id;
        const priorityId = t.priority?.id || t.priority_id;
        const statusId = t.status?.id || t.status_id;
        const companyMatch = !filters.company || String(companyId) === filters.company || (t.company?.name || '').toLowerCase().includes(filters.company.toLowerCase());
        const priorityMatch = !filters.priority || String(priorityId) === filters.priority;
        const statusMatch = !filters.status || String(statusId) === filters.status;
        return searchMatch && companyMatch && priorityMatch && statusMatch;
    });

    const getPriorityBadge = (t) => {
        const v = (t.priority?.name || t.priority || '').toLowerCase();
        if (v === 'high' || v === 'urgent') return 'badge-high';
        if (v === 'medium') return 'badge-medium';
        return 'badge-low';
    };

    const getStatusBadge = (t) => {
        const v = (t.status?.name || t.status || '').toLowerCase();
        if (v === 'open') return 'badge-open';
        if (v === 'closed' || v === 'resolved') return 'badge-closed';
        if (v === 'in progress') return 'badge-progress';
        return 'badge-default-status';
    };

    return (
        <div className="master-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Ticket List</h1>
                    <p className="page-subtitle">{tickets.length} tickets total</p>
                </div>
                <button className="btn-primary" onClick={() => navigate('/ticket/create-ticket')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Create Ticket
                </button>
            </div>

            <div className="master-card">
                <div className="ticket-toolbar">
                    <input
                        type="text"
                        placeholder="Search tickets..."
                        className="search-input"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <select
                        className="filter-select"
                        value={filters.priority}
                        onChange={e => setFilters(f => ({ ...f, priority: e.target.value }))}
                    >
                        <option value="">All Priorities</option>
                        {priorities.map(p => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
                    </select>
                    <select
                        className="filter-select"
                        value={filters.status}
                        onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
                    >
                        <option value="">All Statuses</option>
                        {statuses.map(s => <option key={s.id} value={String(s.id)}>{s.name}</option>)}
                    </select>
                </div>

                {error && <div className="error-banner">{error}</div>}

                {loading ? (
                    <div className="table-loading">Loading tickets...</div>
                ) : filtered.length === 0 ? (
                    <div className="table-empty">No tickets found.</div>
                ) : (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Subject</th>
                                    <th>Company</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>Assigned To</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((ticket, i) => (
                                    <tr key={ticket.id || i}>
                                        <td>{ticket.id || i + 1}</td>
                                        <td>
                                            <div className="ticket-subject">{ticket.subject || ticket.title || '-'}</div>
                                            {ticket.description && (
                                                <div className="ticket-desc">{String(ticket.description).slice(0, 60)}{ticket.description?.length > 60 ? '...' : ''}</div>
                                            )}
                                        </td>
                                        <td>{ticket.company?.name || ticket.company || '-'}</td>
                                        <td>
                                            <span className={`ticket-badge ${getPriorityBadge(ticket)}`}>
                                                {ticket.priority?.name || ticket.priority || '-'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`ticket-badge ${getStatusBadge(ticket)}`}>
                                                {ticket.status?.name || ticket.status || '-'}
                                            </span>
                                        </td>
                                        <td>{ticket.assigned_to?.name || ticket.assignee?.name || '-'}</td>
                                        <td>{ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : '-'}</td>
                                        <td>
                                            <div className="action-btns">
                                                <button className="action-btn edit-btn" onClick={() => navigate('/ticket/show-ticket', { state: { ticket } })} title="View">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                                </button>
                                                <button className="action-btn delete-btn" onClick={() => setDeleteConfirm(ticket.id)} title="Delete">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {deleteConfirm !== null && (
                <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Confirm Delete</h3>
                            <button className="modal-close" onClick={() => setDeleteConfirm(null)}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>
                        <div className="modal-body">
                            <p style={{ color: '#4a5568' }}>Are you sure you want to delete this ticket?</p>
                            <div className="modal-footer">
                                <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                                <button className="btn-danger" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TicketList;
