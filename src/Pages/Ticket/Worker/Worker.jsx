import React, { useEffect, useState } from "react";
import { getWorkLogs } from "@/Api/TicketApi/ticketAPI";
import "@/Components/MasterDash/master.css";

const Worker = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        getWorkLogs()
            .then(res => setLogs(Array.isArray(res) ? res : (res?.data ?? [])))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const filtered = logs.filter(log =>
        !search ||
        (log.worker?.name || log.user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (log.ticket?.subject || log.ticket_id || '').toString().toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="master-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Work Details</h1>
                    <p className="page-subtitle">{logs.length} work logs total</p>
                </div>
            </div>

            <div className="master-card">
                <div className="card-toolbar">
                    <input
                        type="text"
                        placeholder="Search by worker or ticket..."
                        className="search-input"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                {error && <div className="error-banner">{error}</div>}

                {loading ? (
                    <div className="table-loading">Loading work logs...</div>
                ) : filtered.length === 0 ? (
                    <div className="table-empty">No work logs found.</div>
                ) : (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Worker</th>
                                    <th>Ticket</th>
                                    <th>Description</th>
                                    <th>Hours</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((log, i) => (
                                    <tr key={log.id || i}>
                                        <td>{i + 1}</td>
                                        <td>{log.worker?.name || log.user?.name || '-'}</td>
                                        <td>{log.ticket?.subject || `#${log.ticket_id}` || '-'}</td>
                                        <td>{log.description || log.remarks || '-'}</td>
                                        <td>{log.hours || log.time_spent || '-'}</td>
                                        <td>{log.created_at ? new Date(log.created_at).toLocaleDateString() : '-'}</td>
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

export default Worker;
