import React, { useEffect, useState } from "react";
import { getTickets } from "@/Api/TicketApi/ticketAPI";
import { companyAPI, departmentAPI } from "@/Api/MasterApi/masterAPI";
import { useAuth } from "@/Components/Login/AuthContext";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";

const StatCard = ({ label, value, color, icon }) => (
    <div className={`stat-card stat-${color}`}>
        <div className="stat-icon">{icon}</div>
        <div className="stat-body">
            <div className="stat-value">{value ?? <span className="stat-loading">—</span>}</div>
            <div className="stat-label">{label}</div>
        </div>
    </div>
);

const icons = {
    total: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 5v2M15 11v2M15 17v2M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7a2 2 0 0 1 2-2z"/></svg>,
    open: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    closed: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
    company: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
};

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.allSettled([
            getTickets(),
            companyAPI.getAll(),
        ]).then(([ticketsRes, companiesRes]) => {
            if (ticketsRes.status === 'fulfilled') {
                const data = ticketsRes.value;
                setTickets(Array.isArray(data) ? data : (data?.data ?? []));
            }
            if (companiesRes.status === 'fulfilled') {
                const data = companiesRes.value;
                setCompanies(Array.isArray(data) ? data : (data?.data ?? []));
            }
            setLoading(false);
        });
    }, []);

    const openTickets = tickets.filter(t => {
        const s = (t.status?.name || t.status || '').toLowerCase();
        return s === 'open' || s === 'pending' || s === 'in progress';
    }).length;

    const closedTickets = tickets.filter(t => {
        const s = (t.status?.name || t.status || '').toLowerCase();
        return s === 'closed' || s === 'resolved' || s === 'done';
    }).length;

    const recent = [...tickets].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)).slice(0, 8);

    const getPriorityClass = (p) => {
        const v = (p?.name || p || '').toLowerCase();
        if (v === 'high' || v === 'urgent') return 'priority-high';
        if (v === 'medium') return 'priority-medium';
        return 'priority-low';
    };

    const getStatusClass = (s) => {
        const v = (s?.name || s || '').toLowerCase();
        if (v === 'open') return 'status-open';
        if (v === 'closed' || v === 'resolved') return 'status-closed';
        if (v === 'in progress') return 'status-progress';
        return 'status-default';
    };

    return (
        <div className="dashboard-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle">Welcome back, {user?.name || 'Admin'}</p>
                </div>
            </div>

            <div className="stats-grid">
                <StatCard label="Total Tickets" value={loading ? null : tickets.length} color="blue" icon={icons.total} />
                <StatCard label="Open Tickets" value={loading ? null : openTickets} color="orange" icon={icons.open} />
                <StatCard label="Closed Tickets" value={loading ? null : closedTickets} color="green" icon={icons.closed} />
                <StatCard label="Companies" value={loading ? null : companies.length} color="purple" icon={icons.company} />
            </div>

            <div className="dashboard-card">
                <div className="card-header">
                    <h2 className="card-title">Recent Tickets</h2>
                    <button className="btn-link" onClick={() => navigate('/ticket/ticket')}>View All</button>
                </div>
                {loading ? (
                    <div className="table-loading">Loading tickets...</div>
                ) : recent.length === 0 ? (
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
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recent.map((ticket, i) => (
                                    <tr key={ticket.id || i} onClick={() => navigate('/ticket/ticket')} className="table-row-link">
                                        <td>{ticket.id || i + 1}</td>
                                        <td>{ticket.subject || ticket.title || '-'}</td>
                                        <td>{ticket.company?.name || ticket.company || '-'}</td>
                                        <td>
                                            <span className={`badge priority-badge ${getPriorityClass(ticket.priority)}`}>
                                                {ticket.priority?.name || ticket.priority || '-'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge status-badge ${getStatusClass(ticket.status)}`}>
                                                {ticket.status?.name || ticket.status || '-'}
                                            </span>
                                        </td>
                                        <td>
                                            {ticket.created_at
                                                ? new Date(ticket.created_at).toLocaleDateString()
                                                : '-'}
                                        </td>
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

export default Dashboard;
