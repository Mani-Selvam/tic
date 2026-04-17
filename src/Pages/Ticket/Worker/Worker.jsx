import React, { useEffect, useState } from "react";
import { getWorkAnalysis } from "@/Api/TicketApi/ticketAPI";
import "@/Components/MasterDash/master.css";

const Worker = () => {
    const [analyses, setAnalyses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        getWorkAnalysis()
            .then((res) => {
                setAnalyses(Array.isArray(res) ? res : (res?.data ?? []));
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const filtered = analyses.filter(
        (a) =>
            !search ||
            (a.worker_name || "").toLowerCase().includes(search.toLowerCase()) ||
            (a.ticket_id?.title || a.ticket_id?.ticket_id || "")
                .toString()
                .toLowerCase()
                .includes(search.toLowerCase()),
    );

    const approvalBadge = (status) => {
        if (status === "Approved") return { background: "#f0fdf4", color: "#15803d" };
        if (status === "Rejected") return { background: "#fef2f2", color: "#dc2626" };
        return { background: "#fffbeb", color: "#d97706" };
    };

    return (
        <div className="master-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Work Details</h1>
                    <p className="page-subtitle">
                        {analyses.length} work analysis records total
                    </p>
                </div>
            </div>

            <div className="master-card">
                <div className="card-toolbar">
                    <input
                        type="text"
                        placeholder="Search by worker or ticket..."
                        className="search-input"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {error && <div className="error-banner">{error}</div>}

                {loading ? (
                    <div className="table-loading">Loading work details...</div>
                ) : filtered.length === 0 ? (
                    <div className="table-empty">No work details found.</div>
                ) : (
                    <>
                        {/* ── Desktop / Tablet: Table ── */}
                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Assigned User</th>
                                        <th>Ticket</th>
                                        <th>Material Required</th>
                                        <th>Material Description</th>
                                        <th>Approval Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((a, i) => (
                                        <tr key={a._id || i}>
                                            <td>{i + 1}</td>
                                            <td style={{ fontWeight: 500 }}>{a.worker_name || "-"}</td>
                                            <td>
                                                {a.ticket_id?.title
                                                    ? <span>{a.ticket_id.title}</span>
                                                    : a.ticket_id?.ticket_id
                                                        ? <span style={{ color: "#6366f1", fontWeight: 600 }}>#{a.ticket_id.ticket_id}</span>
                                                        : "-"}
                                            </td>
                                            <td>
                                                <span
                                                    className="ticket-badge"
                                                    style={a.material_required === "Yes"
                                                        ? { background: "#fef2f2", color: "#dc2626" }
                                                        : { background: "#f0fdf4", color: "#15803d" }}>
                                                    {a.material_required || "-"}
                                                </span>
                                            </td>
                                            <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {a.material_description || "-"}
                                            </td>
                                            <td>
                                                <span
                                                    className="ticket-badge"
                                                    style={approvalBadge(a.approval_status)}>
                                                    {a.approval_status || "Pending"}
                                                </span>
                                            </td>
                                            <td style={{ color: "#718096", fontSize: 12, whiteSpace: "nowrap" }}>
                                                {a.created_at
                                                    ? new Date(a.created_at).toLocaleDateString()
                                                    : a.createdAt
                                                        ? new Date(a.createdAt).toLocaleDateString()
                                                        : "-"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* ── Mobile: Card view ── */}
                        <div className="mobile-cards">
                            {filtered.map((a, i) => (
                                <div key={a._id || i} className="record-card">
                                    <div className="record-card-header">
                                        <div>
                                            <div className="record-card-title">
                                                {a.worker_name || "Unknown Worker"}
                                            </div>
                                            <div className="record-card-subtitle">
                                                {a.ticket_id?.title || (a.ticket_id?.ticket_id ? `Ticket #${a.ticket_id.ticket_id}` : "No ticket")}
                                            </div>
                                        </div>
                                        <span
                                            className="badge"
                                            style={approvalBadge(a.approval_status)}>
                                            {a.approval_status || "Pending"}
                                        </span>
                                    </div>
                                    <div className="record-card-body">
                                        <div className="record-card-field">
                                            <span className="record-card-label">Material Required</span>
                                            <span className="record-card-value">
                                                <span
                                                    className="ticket-badge"
                                                    style={a.material_required === "Yes"
                                                        ? { background: "#fef2f2", color: "#dc2626" }
                                                        : { background: "#f0fdf4", color: "#15803d" }}>
                                                    {a.material_required || "-"}
                                                </span>
                                            </span>
                                        </div>
                                        <div className="record-card-field">
                                            <span className="record-card-label">Date</span>
                                            <span className="record-card-value">
                                                {a.created_at
                                                    ? new Date(a.created_at).toLocaleDateString()
                                                    : a.createdAt
                                                        ? new Date(a.createdAt).toLocaleDateString()
                                                        : "-"}
                                            </span>
                                        </div>
                                        {a.material_description && (
                                            <div className="record-card-field full-width">
                                                <span className="record-card-label">Material Description</span>
                                                <span className="record-card-value">{a.material_description}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Worker;
