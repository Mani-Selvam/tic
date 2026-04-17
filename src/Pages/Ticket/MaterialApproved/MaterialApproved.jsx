import React, { useEffect, useState } from "react";
import { getMaterialApprovedWorkAnalysis } from "@/Api/TicketApi/ticketAPI";
import "@/Components/MasterDash/master.css";

const MaterialApproved = () => {
    const [analyses, setAnalyses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        getMaterialApprovedWorkAnalysis()
            .then((res) => {
                const analyses = Array.isArray(res) ? res : (res?.data ?? []);
                setAnalyses(analyses);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const filtered = analyses.filter(
        (analysis) =>
            !search ||
            (analysis.worker_name || "")
                .toLowerCase()
                .includes(search.toLowerCase()) ||
            (analysis.ticket_id?.title || analysis.ticket_id?.ticket_id || "")
                .toString()
                .toLowerCase()
                .includes(search.toLowerCase()),
    );

    return (
        <div className="master-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Material Approved</h1>
                    <p className="page-subtitle">
                        {analyses.length} material approved analyses total
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
                    <div className="table-loading">
                        Loading material approved analyses...
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="table-empty">
                        No material approved analyses found.
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Worker</th>
                                    <th>Ticket</th>
                                    <th>Material Required</th>
                                    <th>Description</th>
                                    <th>Status</th>
                                    <th>Approved At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((analysis, i) => (
                                    <tr key={analysis._id || i}>
                                        <td>{i + 1}</td>
                                        <td>{analysis.worker_name || "-"}</td>
                                        <td>
                                            {analysis.ticket_id?.title ||
                                                `#${analysis.ticket_id?.ticket_id}` ||
                                                "-"}
                                        </td>
                                        <td>
                                            {analysis.material_required || "-"}
                                        </td>
                                        <td>
                                            {analysis.material_description ||
                                                "-"}
                                        </td>
                                        <td>
                                            {analysis.approval_status || "-"}
                                        </td>
                                        <td>
                                            {analysis.approved_at
                                                ? new Date(
                                                      analysis.approved_at,
                                                  ).toLocaleDateString()
                                                : "-"}
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

export default MaterialApproved;
